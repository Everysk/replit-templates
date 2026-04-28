import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchFile from "./useFetchFile";
import type { File } from "@src/types/file";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    getFile: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/file", () => ({ getFile: mocks.getFile }));

const rawFile: File = {
    id: "file-1",
    name: "report.csv",
    workspace: "ws-1",
    content_type: "text/csv",
    version: "1",
    link_uid: null,
    data: "SGVsbG8=",
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { Wrapper };
};

beforeEach(() => vi.clearAllMocks());

it("calls getFile with the api, id and workspace", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFile.mockResolvedValue(rawFile);

    const { result } = renderHook(
        () => useFetchFile({ id: "file-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getFile).toHaveBeenCalledWith(mocks.api, "file-1", "ws-1");
});

it("returns the file data on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFile.mockResolvedValue(rawFile);

    const { result } = renderHook(
        () => useFetchFile({ id: "file-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rawFile);
});

it("returns the correct queryKey", () => {
    const { Wrapper } = createWrapper();
    mocks.getFile.mockResolvedValue(rawFile);

    const { result } = renderHook(
        () => useFetchFile({ id: "file-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["file", "file-1", "ws-1"]);
});

it("shows an error alert when the query fails", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFile.mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(
        () => useFetchFile({ id: "file-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Not found",
        })
    );
});

it("does not show an alert on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFile.mockResolvedValue(rawFile);

    const { result } = renderHook(
        () => useFetchFile({ id: "file-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.showAlert).not.toHaveBeenCalled();
});
