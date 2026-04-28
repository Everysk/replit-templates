import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchFiles } from "./useFetchFiles";
import type { File } from "@src/types/file";

const mocks = vi.hoisted(() => ({
    api: {},
    getFiles: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/file", () => ({ getFiles: mocks.getFiles }));

const makeFile = (id: string): File => ({
    id,
    name: `file-${id}.csv`,
    workspace: "ws-1",
    content_type: "text/csv",
    version: "1",
    link_uid: null,
    data: null,
});

const filters = [{ field: "workspace", value: "ws-1" }];

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

it("calls getFiles and returns the files on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFiles.mockResolvedValue({
        files: [makeFile("f-1"), makeFile("f-2")],
        next_page_token: null,
    });

    const { result } = renderHook(
        () => useFetchFiles({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0].id).toBe("f-1");
});

it("returns the correct queryKey for the given filters", () => {
    const { Wrapper } = createWrapper();
    mocks.getFiles.mockResolvedValue({ files: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchFiles({ filters }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["files", "ws-1"]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFiles.mockResolvedValue({
        files: [makeFile("f-1")],
        next_page_token: "token-2",
    });

    const { result } = renderHook(
        () => useFetchFiles({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFiles.mockResolvedValue({ files: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchFiles({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getFiles
        .mockResolvedValueOnce({ files: [makeFile("f-1")], next_page_token: "token-2" })
        .mockResolvedValueOnce({ files: [makeFile("f-2")], next_page_token: null });

    const { result } = renderHook(
        () => useFetchFiles({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((f) => f.id)).toEqual(["f-1", "f-2"]);
});
