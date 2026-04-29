import { AxiosError, type AxiosInstance } from "axios";
import { getWorkspace, getWorkspaces } from ".";

const makeApi = () => ({
    get: vi.fn(),
}) as unknown as AxiosInstance;

const axiosErr = (msg: string) => new AxiosError(msg);

const baseWorkspace = { name: "main", group: null, description: "Main", version: "1", created: 0, updated: 0 };

describe("getWorkspace", () => {
    it("calls GET workspaces/:name and returns the workspace", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workspace: baseWorkspace } });

        const result = await getWorkspace(api, "main");

        expect(api.get).toHaveBeenCalledWith("workspaces/main");
        expect(result).toEqual(baseWorkspace);
    });

    it("throws when name is missing", async () => {
        const api = makeApi();
        await expect(getWorkspace(api, "")).rejects.toThrow("Workspace name is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(getWorkspace(api, "main")).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkspace(api, "main")).rejects.toThrow("Error while fetching workspace");
    });
});

describe("getWorkspaces", () => {
    it("calls GET workspaces and returns the response", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workspaces: [baseWorkspace], next_page_token: null } });

        const result = await getWorkspaces(api);

        expect(api.get).toHaveBeenCalledWith("workspaces", { params: {} });
        expect(result).toEqual({ workspaces: [baseWorkspace], next_page_token: null });
    });

    it("passes workspace, pageSize and pageToken as params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { workspaces: [], next_page_token: null } });

        await getWorkspaces(api, "ws-1", 20, "tok-2");

        expect(api.get).toHaveBeenCalledWith("workspaces", {
            params: { workspace: "ws-1", page_size: 20, page_token: "tok-2" },
        });
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getWorkspaces(api)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getWorkspaces(api)).rejects.toThrow("Error while fetching workspaces");
    });
});
