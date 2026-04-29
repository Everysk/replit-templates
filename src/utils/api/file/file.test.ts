import { AxiosError, type AxiosInstance } from "axios";
import { getFile, getFiles, postFile, updateFile, deleteFile } from ".";

const makeApi = () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}) as unknown as AxiosInstance;

const axiosErr = (msg: string) => new AxiosError(msg);

const baseFile = { id: "f-1", name: "report.csv", workspace: "ws-1", content_type: "text/csv", version: "1", link_uid: null, data: null };
const baseQuery = { filters: [["workspace", "ws-1"]] as [string, string][], order: [] };

describe("getFile", () => {
    it("calls GET files/:id and returns the file", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { file: baseFile } });

        const result = await getFile(api, "f-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("files/f-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual(baseFile);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getFile(api, "f-1", "")).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Network error"));
        await expect(getFile(api, "f-1", "ws-1")).rejects.toThrow("Network error");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getFile(api, "f-1", "ws-1")).rejects.toThrow("Error while fetching file");
    });
});

describe("getFiles", () => {
    it("calls GET files with workspace and query params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { files: [], next_page_token: null } });

        await getFiles(api, baseQuery);

        expect(api.get).toHaveBeenCalledWith("files", {
            params: expect.objectContaining({ workspace: "ws-1", query: JSON.stringify(baseQuery) }),
        });
    });

    it("throws when workspace filter is missing", async () => {
        const api = makeApi();
        await expect(getFiles(api, { filters: [], order: [] })).rejects.toThrow("Workspace filter is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getFiles(api, baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getFiles(api, baseQuery)).rejects.toThrow("Error while fetching files");
    });
});

describe("postFile", () => {
    it("calls POST files and returns the created file", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { file: baseFile } });

        const result = await postFile(api, { workspace: "ws-1", name: "report.csv" });

        expect(api.post).toHaveBeenCalledWith("files", { workspace: "ws-1", name: "report.csv" });
        expect(result).toEqual(baseFile);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(postFile(api, { name: "report.csv" })).rejects.toThrow("Workspace filter is required");
        expect(api.post).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Conflict"));
        await expect(postFile(api, { workspace: "ws-1" })).rejects.toThrow("Conflict");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(postFile(api, { workspace: "ws-1" })).rejects.toThrow("Error while creating file");
    });
});

describe("updateFile", () => {
    it("calls PUT files/:id and returns the updated file", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { file: baseFile } });

        const result = await updateFile(api, "f-1", { workspace: "ws-1", name: "renamed.csv" });

        expect(api.put).toHaveBeenCalledWith("files/f-1", { workspace: "ws-1", name: "renamed.csv" });
        expect(result).toEqual(baseFile);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(updateFile(api, "f-1", { name: "x" })).rejects.toThrow("Workspace filter is required");
        expect(api.put).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(updateFile(api, "f-1", { workspace: "ws-1" })).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(updateFile(api, "f-1", { workspace: "ws-1" })).rejects.toThrow("Error while updating file");
    });
});

describe("deleteFile", () => {
    it("calls DELETE files/:id and returns the deleted records", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { files: [{ id: "f-1" }] } });

        const result = await deleteFile(api, "f-1", "ws-1");

        expect(api.delete).toHaveBeenCalledWith("files/f-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual([{ id: "f-1" }]);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(deleteFile(api, "f-1", "")).rejects.toThrow("Workspace filter is required");
        expect(api.delete).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Forbidden"));
        await expect(deleteFile(api, "f-1", "ws-1")).rejects.toThrow("Forbidden");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(deleteFile(api, "f-1", "ws-1")).rejects.toThrow("Error while deleting file");
    });
});
