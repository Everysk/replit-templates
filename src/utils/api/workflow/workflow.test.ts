import { AxiosError, type AxiosInstance } from "axios";
import {
    runWorkflow, runWorkflowSync,
    getWorkflow, getWorkflows,
    getWorkflowExecution, getWorkflowExecutions,
    getWorkerExecution, getWorkerExecutions,
} from ".";

const makeApi = () => ({
    get: vi.fn(),
    post: vi.fn(),
}) as unknown as AxiosInstance;

const axiosErr = (msg: string) => new AxiosError(msg);

const baseWorkflow = { id: "wf-1", name: "My Workflow", workspace: "ws-1", description: "", tags: [], status: "active", created: 0, updated: 0, version: "1", trigger_enabled: false, trigger_type: "manual", trigger_config: {}, starter_worker_id: "w-1", ender_worker_id: "w-2" };
const baseExecution = { id: "exec-1", workflow_id: "wf-1", workspace: "ws-1" };
const baseWorkerExecution = { id: "wex-1", workflow_id: "wf-1", workflow_execution_id: "exec-1" };
const baseQuery = { filters: [["workspace", "ws-1"]] as [string, string][], order: [] };

describe("runWorkflow", () => {
    it("calls POST workflows/:id/run with workspace and parameters", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { result: "ok" } });

        const result = await runWorkflow(api, "wf-1", "ws-1", { key: "val" });

        expect(api.post).toHaveBeenCalledWith("workflows/wf-1/run", { workspace: "ws-1", parameters: { key: "val" } });
        expect(result).toEqual({ result: "ok" });
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(runWorkflow(api, "wf-1", "", {})).rejects.toThrow("Workspace is required");
        expect(api.post).not.toHaveBeenCalled();
    });

    it("throws when run_status is FAILED", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
            data: { workflow_execution: { run_status: "FAILED" } },
        });
        await expect(runWorkflow(api, "wf-1", "ws-1", {})).rejects.toThrow("Error while running workflow");
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(runWorkflow(api, "wf-1", "ws-1", {})).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(runWorkflow(api, "wf-1", "ws-1", {})).rejects.toThrow("Error while running workflow");
    });
});

describe("runWorkflowSync", () => {
    it("calls POST workflows/:id/run with synchronous: true", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { result: "done" } });

        await runWorkflowSync(api, "wf-1", "ws-1", { k: "v" });

        expect(api.post).toHaveBeenCalledWith("workflows/wf-1/run", { workspace: "ws-1", synchronous: true, parameters: { k: "v" } });
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(runWorkflowSync(api, "wf-1", "", {})).rejects.toThrow("Workspace is required");
        expect(api.post).not.toHaveBeenCalled();
    });

    it("throws when run_status is FAILED", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
            data: { workflow_execution: { run_status: "FAILED" } },
        });
        await expect(runWorkflowSync(api, "wf-1", "ws-1", {})).rejects.toThrow("Error while running workflow");
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Server error"));
        await expect(runWorkflowSync(api, "wf-1", "ws-1", {})).rejects.toThrow("Server error");
    });
});

describe("getWorkflow", () => {
    it("calls GET workflows/:id and returns the workflow", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflow: baseWorkflow } });

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
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkflow(api, "wf-1", "ws-1")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkflow(api, "wf-1", "ws-1")).rejects.toThrow("Error while fetching workflow");
    });
});

describe("getWorkflows", () => {
    it("calls GET workflows and returns the response", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflows: [baseWorkflow], next_page_token: null } });

        const result = await getWorkflows(api, "ws-1", 10, "tok");

        expect(api.get).toHaveBeenCalledWith("workflows", { params: { workspace: "ws-1", page_size: 10, page_token: "tok" } });
        expect(result).toEqual({ workflows: [baseWorkflow], next_page_token: null });
    });

    it("omits optional params when not provided", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflows: [], next_page_token: null } });

        await getWorkflows(api);

        expect(api.get).toHaveBeenCalledWith("workflows", { params: {} });
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkflows(api)).rejects.toThrow("Timeout");
    });
});

describe("getWorkflowExecution", () => {
    it("calls GET workflows/:workflowId/workflow_executions with workspace and executionId params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflow_execution: baseExecution } });

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
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkflowExecution(api, "wf-1", "exec-1", "ws-1")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkflowExecution(api, "wf-1", "exec-1", "ws-1")).rejects.toThrow("Error fetching workflow execution");
    });
});

describe("getWorkflowExecutions", () => {
    it("calls GET workflows/:id/workflow_executions with workspace and query", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflow_executions: [], next_page_token: null } });

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
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkflowExecutions(api, "wf-1", baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkflowExecutions(api, "wf-1", baseQuery)).rejects.toThrow("Error listing workflow executions");
    });
});

describe("getWorkerExecution", () => {
    it("calls GET workflows/:workflowId/worker_executions with workspace and workerExecutionId params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { worker_execution: baseWorkerExecution } });

        const result = await getWorkerExecution(api, "wf-1", "wex-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1/worker_executions", {
            params: { workspace: "ws-1", worker_execution_id: "wex-1" },
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
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkerExecution(api, "wf-1", "wex-1", "ws-1")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkerExecution(api, "wf-1", "wex-1", "ws-1")).rejects.toThrow("Error fetching worker execution");
    });
});

describe("getWorkerExecutions", () => {
    it("calls GET workflows/:id/worker_executions with workspace, workflowExecutionId and query", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { worker_executions: [], next_page_token: null, parallel_index_max: 0 } });

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
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkerExecutions(api, "wf-1", "exec-1", baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkerExecutions(api, "wf-1", "exec-1", baseQuery)).rejects.toThrow("Error listing worker executions");
    });
});
