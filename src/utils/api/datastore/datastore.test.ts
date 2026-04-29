import { AxiosError, type AxiosInstance } from "axios";
import { getDatastore, getDatastores, postDatastore, updateDatastore, deleteDatastore } from ".";

const makeApi = () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}) as unknown as AxiosInstance;

const axiosErr = (msg: string) => new AxiosError(msg);

const baseDatastore = { id: "ds-1", name: "My DS", workspace: "ws-1" };
const baseQuery = { filters: [["workspace", "ws-1"]] as [string, string][], order: [] };

describe("getDatastore", () => {
    it("calls GET datastores/:id and returns the datastore", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { datastore: baseDatastore } });

        const result = await getDatastore(api, "ds-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("datastores/ds-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual(baseDatastore);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getDatastore(api, "ds-1", "")).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Network error"));
        await expect(getDatastore(api, "ds-1", "ws-1")).rejects.toThrow("Network error");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getDatastore(api, "ds-1", "ws-1")).rejects.toThrow("Error fetching datastore");
    });
});

describe("getDatastores", () => {
    it("calls GET datastores with workspace and query params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { datastores: [], next_page_token: null } });

        await getDatastores(api, baseQuery);

        expect(api.get).toHaveBeenCalledWith("datastores", {
            params: expect.objectContaining({ workspace: "ws-1", query: JSON.stringify(baseQuery) }),
        });
    });

    it("throws when workspace filter is missing", async () => {
        const api = makeApi();
        await expect(getDatastores(api, { filters: [], order: [] })).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getDatastores(api, baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getDatastores(api, baseQuery)).rejects.toThrow("Error listing datastores");
    });
});

describe("postDatastore", () => {
    it("calls POST datastores and returns the created datastore", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { datastore: baseDatastore } });

        const result = await postDatastore(api, { workspace: "ws-1", name: "My DS" });

        expect(api.post).toHaveBeenCalledWith("datastores", { workspace: "ws-1", name: "My DS" });
        expect(result).toEqual(baseDatastore);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(postDatastore(api, { name: "My DS" })).rejects.toThrow("Workspace filter is required");
        expect(api.post).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Conflict"));
        await expect(postDatastore(api, { workspace: "ws-1" })).rejects.toThrow("Conflict");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(postDatastore(api, { workspace: "ws-1" })).rejects.toThrow("Error creating datastore");
    });
});

describe("updateDatastore", () => {
    it("calls PUT datastores/:id and returns the updated datastore", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { datastore: baseDatastore } });

        const result = await updateDatastore(api, "ds-1", { workspace: "ws-1", name: "Renamed" });

        expect(api.put).toHaveBeenCalledWith("datastores/ds-1", { workspace: "ws-1", name: "Renamed" });
        expect(result).toEqual(baseDatastore);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(updateDatastore(api, "ds-1", { name: "X" })).rejects.toThrow("Workspace filter is required");
        expect(api.put).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(updateDatastore(api, "ds-1", { workspace: "ws-1" })).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(updateDatastore(api, "ds-1", { workspace: "ws-1" })).rejects.toThrow("Error updating datastore");
    });
});

describe("deleteDatastore", () => {
    it("calls DELETE datastores/:id and returns the deleted records", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { datastores: [{ id: "ds-1" }] } });

        const result = await deleteDatastore(api, "ds-1", "ws-1");

        expect(api.delete).toHaveBeenCalledWith("datastores/ds-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual([{ id: "ds-1" }]);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(deleteDatastore(api, "ds-1", "")).rejects.toThrow("Workspace filter is required");
        expect(api.delete).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Forbidden"));
        await expect(deleteDatastore(api, "ds-1", "ws-1")).rejects.toThrow("Forbidden");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(deleteDatastore(api, "ds-1", "ws-1")).rejects.toThrow("Error removing datastore");
    });
});
