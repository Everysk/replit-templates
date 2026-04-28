import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchWorkflows } from "./useFetchWorkflows";
import type { Workflow } from "@src/types/workflow";

const mocks = vi.hoisted(() => ({
    api: {},
    getWorkflows: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/workflow", () => ({ getWorkflows: mocks.getWorkflows }));

const makeWorkflow = (id: string): Workflow => ({
    id,
    name: `Workflow ${id}`,
    workspace: "ws-1",
    description: "",
    tags: [],
    status: "active",
    created: 0,
    updated: 0,
    version: "1",
    trigger_enabled: false,
    trigger_type: "manual",
    trigger_config: {},
    starter_worker_id: "w-1",
    ender_worker_id: "w-2",
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

it("calls getWorkflows and returns the workflows on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflows.mockResolvedValue({
        workflows: [makeWorkflow("wf-1"), makeWorkflow("wf-2")],
        next_page_token: null,
    });

    const { result } = renderHook(
        () => useFetchWorkflows({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0].id).toBe("wf-1");
});

it("returns the correct queryKey for the given workspace", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflows.mockResolvedValue({ workflows: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflows({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workflows", "ws-1"]);
});

it("queryKey uses null when workspace is undefined", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflows.mockResolvedValue({ workflows: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflows({}),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workflows", null]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflows.mockResolvedValue({
        workflows: [makeWorkflow("wf-1")],
        next_page_token: "token-2",
    });

    const { result } = renderHook(
        () => useFetchWorkflows({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflows.mockResolvedValue({ workflows: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflows({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflows
        .mockResolvedValueOnce({ workflows: [makeWorkflow("wf-1")], next_page_token: "token-2" })
        .mockResolvedValueOnce({ workflows: [makeWorkflow("wf-2")], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflows({ workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((w) => w.id)).toEqual(["wf-1", "wf-2"]);
});
