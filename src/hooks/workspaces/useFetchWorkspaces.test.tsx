import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchWorkspaces } from "./useFetchWorkspaces";
import type { Workspace } from "@src/types/workspace";

const mocks = vi.hoisted(() => ({
    api: {},
    getWorkspaces: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/workspace", () => ({ getWorkspaces: mocks.getWorkspaces }));

const makeWorkspace = (name: string): Workspace => ({
    name,
    group: null,
    description: `Workspace ${name}`,
    version: "1",
    created: 0,
    updated: 0,
});

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

it("calls getWorkspaces and returns the workspaces on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspaces.mockResolvedValue({
        workspaces: [makeWorkspace("ws-1"), makeWorkspace("ws-2")],
        next_page_token: null,
    });

    const { result } = renderHook(
        () => useFetchWorkspaces({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0].name).toBe("ws-1");
});

it("returns the correct queryKey for the given workspace", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspaces.mockResolvedValue({ workspaces: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkspaces({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workspaces", "ws-1"]);
});

it("queryKey uses null when workspace is undefined", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspaces.mockResolvedValue({ workspaces: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkspaces({}),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workspaces", null]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspaces.mockResolvedValue({
        workspaces: [makeWorkspace("ws-1")],
        next_page_token: "token-2",
    });

    const { result } = renderHook(
        () => useFetchWorkspaces({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspaces.mockResolvedValue({ workspaces: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkspaces({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspaces
        .mockResolvedValueOnce({ workspaces: [makeWorkspace("ws-1")], next_page_token: "token-2" })
        .mockResolvedValueOnce({ workspaces: [makeWorkspace("ws-2")], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkspaces({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((w) => w.name)).toEqual(["ws-1", "ws-2"]);
});
