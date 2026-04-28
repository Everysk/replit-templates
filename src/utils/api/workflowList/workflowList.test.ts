import { AxiosError, type AxiosInstance } from "axios";
import { getWorkflows, getWorkflowExecutions, getWorkspaces } from ".";

const makeApi = () => ({
    get: vi.fn(),
}) as unknown as AxiosInstance;

const axiosErr = (msg: string) => new AxiosError(msg);

describe("getWorkflows (deprecated)", () => {
    it("calls GET workflows with workspace and page_size params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflows: [{ id: "wf-1" }] } });

        const result = await getWorkflows(api, "ws-1");

        expect(api.get).toHaveBeenCalledWith("workflows", { params: { page_size: 20, workspace: "ws-1" } });
        expect(result).toEqual([{ id: "wf-1" }]);
    });

    it("returns empty array when workflows is absent from response", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

        const result = await getWorkflows(api, "ws-1");
        expect(result).toEqual([]);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getWorkflows(api, "")).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Network error"));
        await expect(getWorkflows(api, "ws-1")).rejects.toThrow("Network error");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkflows(api, "ws-1")).rejects.toThrow("Error listing workflows");
    });
});

describe("getWorkflowExecutions (deprecated)", () => {
    it("calls GET workflows/:id/workflow_executions and returns executions", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workflow_executions: [{ id: "exec-1" }] } });

        const result = await getWorkflowExecutions(api, "wf-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("workflows/wf-1/workflow_executions", {
            params: { page_size: 20, workspace: "ws-1" },
        });
        expect(result).toEqual([{ id: "exec-1" }]);
    });

    it("returns empty array when workflow_executions is absent from response", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

        const result = await getWorkflowExecutions(api, "wf-1", "ws-1");
        expect(result).toEqual([]);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getWorkflowExecutions(api, "wf-1", "")).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkflowExecutions(api, "wf-1", "ws-1")).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkflowExecutions(api, "wf-1", "ws-1")).rejects.toThrow("Error listing workflow executions");
    });
});

describe("getWorkspaces (deprecated)", () => {
    it("calls GET workspaces and returns workspaces", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workspaces: [{ name: "main" }] } });

        const result = await getWorkspaces(api);

        expect(api.get).toHaveBeenCalledWith("workspaces", { params: { page_size: 1000 } });
        expect(result).toEqual([{ name: "main" }]);
    });

    it("returns empty array when workspaces is absent from response", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

        const result = await getWorkspaces(api);
        expect(result).toEqual([]);
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Forbidden"));
        await expect(getWorkspaces(api)).rejects.toThrow("Forbidden");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkspaces(api)).rejects.toThrow("Error listing workspaces");
    });
});
