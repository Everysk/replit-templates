import { AxiosError, type AxiosInstance } from "axios";

import {
    runWorkflow,
    pollWorkflowExecution,
    runWorkflowAndGetResult,
    TERMINAL_RUN_STATUSES,
    getWorkflow, getWorkflows,
    getWorkflowExecution, getWorkflowExecutions,
    getWorkerExecution, getWorkerExecutions,
} from ".";

const makeApi = () => ({
    get: vi.fn(),
    post: vi.fn(),
}) as unknown as AxiosInstance;

type Mock = ReturnType<typeof vi.fn>;
const get = (api: AxiosInstance) => api.get as unknown as Mock;
const post = (api: AxiosInstance) => api.post as unknown as Mock;

const axiosErr = (msg: string) => new AxiosError(msg);

const baseWorkflow = { id: "wf-1", name: "My Workflow", workspace: "ws-1", description: "", tags: [], status: "active", created: 0, updated: 0, version: "1", trigger_enabled: false, trigger_type: "manual", trigger_config: {}, starter_worker_id: "w-1", ender_worker_id: "w-2" };
const baseExecution = { id: "exec-1", workflow_id: "wf-1", workspace: "ws-1" };
const baseWorkerExecution = { id: "wex-1", workflow_id: "wf-1", workflow_execution_id: "exec-1" };
const baseQuery = { filters: [["workspace", "ws-1"]] as [string, string][], order: [] };

describe("runWorkflow", () => {
    it("calls POST workflows/:id/run with workspace and parameters", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: { result: "ok" } });

        const result = await runWorkflow(api, "wf-1", "ws-1", { key: "val" });

        expect(api.post).toHaveBeenCalledWith("workflows/wf-1/run", { workspace: "ws-1", parameters: { key: "val" } });
        expect(result).toEqual({ result: "ok" });
    });

    it("does not send synchronous: true", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: {} });

        await runWorkflow(api, "wf-1", "ws-1", {});

        const body = post(api).mock.calls[0][1];
        expect(body).not.toHaveProperty("synchronous");
    });

    it("returns the response even when run_status is FAILED (non-blocking start)", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: { workflow_execution: { run_status: "FAILED" } } });

        const result = await runWorkflow(api, "wf-1", "ws-1", {});

        expect(result).toEqual({ workflow_execution: { run_status: "FAILED" } });
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(runWorkflow(api, "wf-1", "", {})).rejects.toThrow("Workspace is required");
        expect(api.post).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        post(api).mockRejectedValue(axiosErr("Timeout"));
        await expect(runWorkflow(api, "wf-1", "ws-1", {})).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        post(api).mockRejectedValue("oops");
        await expect(runWorkflow(api, "wf-1", "ws-1", {})).rejects.toThrow("Error while running workflow");
    });
});

describe("pollWorkflowExecution", () => {
    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(pollWorkflowExecution(api, "wf-1", "exec-1", "")).rejects.toThrow("Workspace is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("returns immediately when the first status is already terminal", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1", run_status: "COMPLETED" } } });

        const execution = await pollWorkflowExecution(api, "wf-1", "exec-1", "ws-1");

        expect(execution.run_status).toBe("COMPLETED");
        expect(api.get).toHaveBeenCalledTimes(1);
    });

    it.each(TERMINAL_RUN_STATUSES)("stops on terminal status %s", async (status) => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1", run_status: status } } });

        const execution = await pollWorkflowExecution(api, "wf-1", "exec-1", "ws-1");

        expect(execution.run_status).toBe(status);
    });

    it("polls on the configured interval until a terminal status is reached", async () => {
        vi.useFakeTimers();
        try {
            const api = makeApi();
            get(api)
                .mockResolvedValueOnce({ data: { workflow_execution: { id: "exec-1", run_status: "RUNNING" } } })
                .mockResolvedValueOnce({ data: { workflow_execution: { id: "exec-1", run_status: "RUNNING" } } })
                .mockResolvedValueOnce({ data: { workflow_execution: { id: "exec-1", run_status: "SUCCEEDED" } } });

            const promise = pollWorkflowExecution(api, "wf-1", "exec-1", "ws-1", { intervalMs: 1000 });
            await vi.advanceTimersByTimeAsync(2000);
            const execution = await promise;

            expect(execution.run_status).toBe("SUCCEEDED");
            expect(api.get).toHaveBeenCalledTimes(3);
        } finally {
            vi.useRealTimers();
        }
    });

    it("rejects immediately when the abort signal is already aborted", async () => {
        const api = makeApi();
        const controller = new AbortController();
        controller.abort();

        await expect(
            pollWorkflowExecution(api, "wf-1", "exec-1", "ws-1", { signal: controller.signal }),
        ).rejects.toThrow("aborted");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("rejects with a timeout error when no terminal status is reached in time", async () => {
        vi.useFakeTimers();
        try {
            const api = makeApi();
            get(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1", run_status: "RUNNING" } } });

            const promise = pollWorkflowExecution(api, "wf-1", "exec-1", "ws-1", { intervalMs: 1000, timeoutMs: 2000 });
            const assertion = expect(promise).rejects.toThrow("Timed out");
            await vi.advanceTimersByTimeAsync(3000);
            await assertion;
        } finally {
            vi.useRealTimers();
        }
    });
});

describe("runWorkflowAndGetResult", () => {
    it("starts, polls and returns the ender worker result", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1" } } });
        get(api)
            .mockResolvedValueOnce({ data: { workflow_execution: { id: "exec-1", run_status: "COMPLETED", ender_worker_execution_id: "wex-1" } } })
            .mockResolvedValueOnce({ data: { worker_execution: { ...baseWorkerExecution, result: { foo: "bar" } } } });

        const { execution, workerExecution, result } = await runWorkflowAndGetResult(api, "wf-1", "ws-1", { k: "v" });

        expect(execution.id).toBe("exec-1");
        expect(workerExecution?.id).toBe("wex-1");
        expect(result).toEqual({ foo: "bar" });
    });

    it("fetches the ender worker execution with with_result: true", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1" } } });
        get(api)
            .mockResolvedValueOnce({ data: { workflow_execution: { id: "exec-1", run_status: "COMPLETED", ender_worker_execution_id: "wex-1" } } })
            .mockResolvedValueOnce({ data: { worker_execution: baseWorkerExecution } });

        await runWorkflowAndGetResult(api, "wf-1", "ws-1", {});

        expect(api.get).toHaveBeenLastCalledWith("workflows/wf-1/worker_executions", {
            params: { workspace: "ws-1", worker_execution_id: "wex-1", with_result: true },
        });
    });

    it("returns a null result when the execution has no ender worker", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1" } } });
        get(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1", run_status: "COMPLETED" } } });

        const { workerExecution, result } = await runWorkflowAndGetResult(api, "wf-1", "ws-1", {});

        expect(workerExecution).toBeNull();
        expect(result).toBeNull();
        expect(api.get).toHaveBeenCalledTimes(1);
    });

    it("throws when the run response has no execution id to poll", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: {} });

        await expect(runWorkflowAndGetResult(api, "wf-1", "ws-1", {})).rejects.toThrow("did not return an execution id");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("throws when the execution ends in a FAILED status", async () => {
        const api = makeApi();
        post(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1" } } });
        get(api).mockResolvedValue({ data: { workflow_execution: { id: "exec-1", run_status: "FAILED" } } });

        await expect(runWorkflowAndGetResult(api, "wf-1", "ws-1", {})).rejects.toThrow("Workflow execution failed");
    });
});

describe("getWorkflow", () => {
    it("calls GET workflows/:id and returns the workflow", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflow: baseWorkflow } });

        const result = await getWorkflow(api, "wf-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual(baseWorkflow);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getWorkflow(api, "wf-1", "")).rejects.toThrow("Workspace is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        get(api).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkflow(api, "wf-1", "ws-1")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        get(api).mockRejectedValue("oops");
        await expect(getWorkflow(api, "wf-1", "ws-1")).rejects.toThrow("Error while fetching workflow");
    });
});

describe("getWorkflows", () => {
    it("calls GET workflows and returns the response", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflows: [baseWorkflow], next_page_token: null } });

        const result = await getWorkflows(api, "ws-1", 10, "tok");

        expect(api.get).toHaveBeenCalledWith("workflows", { params: { workspace: "ws-1", page_size: 10, page_token: "tok" } });
        expect(result).toEqual({ workflows: [baseWorkflow], next_page_token: null });
    });

    it("omits optional params when not provided", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflows: [], next_page_token: null } });

        await getWorkflows(api);

        expect(api.get).toHaveBeenCalledWith("workflows", { params: {} });
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        get(api).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkflows(api)).rejects.toThrow("Timeout");
    });
});

describe("getWorkflowExecution", () => {
    it("calls GET workflows/:workflowId/workflow_executions with workspace and executionId params", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflow_execution: baseExecution } });

        const result = await getWorkflowExecution(api, "wf-1", "exec-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1/workflow_executions", {
            params: { workspace: "ws-1", workflow_execution_id: "exec-1" },
        });
        expect(result).toEqual(baseExecution);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getWorkflowExecution(api, "wf-1", "exec-1", "")).rejects.toThrow("Workspace is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        get(api).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkflowExecution(api, "wf-1", "exec-1", "ws-1")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        get(api).mockRejectedValue("oops");
        await expect(getWorkflowExecution(api, "wf-1", "exec-1", "ws-1")).rejects.toThrow("Error fetching workflow execution");
    });
});

describe("getWorkflowExecutions", () => {
    it("calls GET workflows/:id/workflow_executions with workspace and query", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { workflow_executions: [], next_page_token: null } });

        await getWorkflowExecutions(api, "wf-1", baseQuery);

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1/workflow_executions", {
            params: expect.objectContaining({ workspace: "ws-1", query: JSON.stringify(baseQuery) }),
        });
    });

    it("throws when workspace filter is missing", async () => {
        const api = makeApi();
        await expect(getWorkflowExecutions(api, "wf-1", { filters: [], order: [] })).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        get(api).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkflowExecutions(api, "wf-1", baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        get(api).mockRejectedValue("oops");
        await expect(getWorkflowExecutions(api, "wf-1", baseQuery)).rejects.toThrow("Error listing workflow executions");
    });
});

describe("getWorkerExecution", () => {
    it("calls GET workflows/:workflowId/worker_executions with workspace, workerExecutionId and with_result", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { worker_execution: baseWorkerExecution } });

        const result = await getWorkerExecution(api, "wf-1", "wex-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1/worker_executions", {
            params: { workspace: "ws-1", worker_execution_id: "wex-1", with_result: true },
        });
        expect(result).toEqual(baseWorkerExecution);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getWorkerExecution(api, "wf-1", "wex-1", "")).rejects.toThrow("Workspace is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        get(api).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkerExecution(api, "wf-1", "wex-1", "ws-1")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        get(api).mockRejectedValue("oops");
        await expect(getWorkerExecution(api, "wf-1", "wex-1", "ws-1")).rejects.toThrow("Error fetching worker execution");
    });
});

describe("getWorkerExecutions", () => {
    it("calls GET workflows/:id/worker_executions with workspace, workflowExecutionId and query", async () => {
        const api = makeApi();
        get(api).mockResolvedValue({ data: { worker_executions: [], next_page_token: null, parallel_index_max: 0 } });

        await getWorkerExecutions(api, "wf-1", "exec-1", baseQuery);

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1/worker_executions", {
            params: expect.objectContaining({ workspace: "ws-1", workflow_execution_id: "exec-1", query: JSON.stringify(baseQuery) }),
        });
    });

    it("throws when workspace filter is missing", async () => {
        const api = makeApi();
        await expect(getWorkerExecutions(api, "wf-1", "exec-1", { filters: [], order: [] })).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        get(api).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkerExecutions(api, "wf-1", "exec-1", baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        get(api).mockRejectedValue("oops");
        await expect(getWorkerExecutions(api, "wf-1", "exec-1", baseQuery)).rejects.toThrow("Error listing worker executions");
    });
});
