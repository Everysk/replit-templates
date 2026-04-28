import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFileMutations from "./useFileMutations";
import type { File } from "@src/types/file";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    postFile: vi.fn(),
    updateFile: vi.fn(),
    deleteFile: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/file", () => ({
    postFile: mocks.postFile,
    updateFile: mocks.updateFile,
    deleteFile: mocks.deleteFile,
}));

const makeFile = (overrides: Partial<File> = {}): File => ({
    id: "file-1",
    name: "report.csv",
    workspace: "ws-1",
    content_type: "text/csv",
    version: "1",
    link_uid: null,
    data: null,
    ...overrides,
});

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { queryClient, Wrapper };
};

beforeEach(() => vi.clearAllMocks());

describe("create", () => {
    it("calls postFile with the api and data", async () => {
        const { Wrapper } = createWrapper();
        mocks.postFile.mockResolvedValue(makeFile());

        const { result } = renderHook(() => useFileMutations({ queryKey: ["files"] }), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1", name: "report.csv" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(mocks.postFile).toHaveBeenCalledWith(mocks.api, { workspace: "ws-1", name: "report.csv" });
    });

    it("shows success alert on success", async () => {
        const { Wrapper } = createWrapper();
        mocks.postFile.mockResolvedValue(makeFile());

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "File created successfully.",
        });
    });

    it("invalidates the queryKey on success", async () => {
        const { Wrapper, queryClient } = createWrapper();
        mocks.postFile.mockResolvedValue(makeFile());
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useFileMutations({ queryKey: ["files"] }), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["files"] });
    });

    it("does not invalidate when queryKey is not provided", async () => {
        const { Wrapper, queryClient } = createWrapper();
        mocks.postFile.mockResolvedValue(makeFile());
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.postFile.mockRejectedValue(new Error("Upload failed"));

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Upload failed",
        });
    });

    it("shows fallback message when the thrown value is not an Error", async () => {
        const { Wrapper } = createWrapper();
        mocks.postFile.mockRejectedValue("unknown");

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to create the file. Please try again.",
        });
    });
});

describe("update", () => {
    it("calls updateFile with id and data and shows success alert", async () => {
        const { Wrapper } = createWrapper();
        mocks.updateFile.mockResolvedValue(makeFile());

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.update.mutate({ id: "file-1", data: { workspace: "ws-1", name: "renamed.csv" } });

        await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
        expect(mocks.updateFile).toHaveBeenCalledWith(mocks.api, "file-1", { workspace: "ws-1", name: "renamed.csv" });
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "File updated successfully.",
        });
    });

    it("shows fallback error message on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.updateFile.mockRejectedValue("oops");

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.update.mutate({ id: "file-1", data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.update.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to update the file. Please try again.",
        });
    });
});

describe("remove", () => {
    it("calls deleteFile with id and workspace and shows success alert", async () => {
        const { Wrapper } = createWrapper();
        mocks.deleteFile.mockResolvedValue([]);

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.remove.mutate({ id: "file-1", workspace: "ws-1" });

        await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
        expect(mocks.deleteFile).toHaveBeenCalledWith(mocks.api, "file-1", "ws-1");
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "File deleted successfully.",
        });
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.deleteFile.mockRejectedValue(new Error("Permission denied"));

        const { result } = renderHook(() => useFileMutations({}), { wrapper: Wrapper });
        result.current.remove.mutate({ id: "file-1", workspace: "ws-1" });

        await waitFor(() => expect(result.current.remove.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Permission denied",
        });
    });
});
