import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchWorkerExecutions } from "./useFetchWorkerExecutions";
import type { WorkerExecution } from "@src/types/workflow";

const mocks = vi.hoisted(() => ({
    api: {},
    getWorkerExecutions: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/workflow", () => ({ getWorkerExecutions: mocks.getWorkerExecutions }));

const makeWorkerExecution = (id: string): WorkerExecution => ({
    id,
    status: "completed",
    worker_id: "w-1",
    worker_name: "My Worker",
    worker_type: "python",
    workflow_execution_id: "exec-1",
    workflow_id: "wf-1",
    workflow_name: "My Workflow",
    trigger: "manual",
    created: 0,
    updated: 0,
    started: 0,
    duration: 500,
    cpu_time: 400,
    result: {},
    input_params: {},
    version: "1",
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

it("calls getWorkerExecutions and returns the worker executions on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecutions.mockResolvedValue({
        worker_executions: [makeWorkerExecution("wex-1"), makeWorkerExecution("wex-2")],
        next_page_token: null,
        parallel_index_max: 0,
    });

    const { result } = renderHook(
        () => useFetchWorkerExecutions({ workflowId: "wf-1", workflowExecutionId: "exec-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0].id).toBe("wex-1");
});

it("returns the correct queryKey for the given workflowId, workflowExecutionId and filters", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecutions.mockResolvedValue({ worker_executions: [], next_page_token: null, parallel_index_max: 0 });

    const { result } = renderHook(
        () => useFetchWorkerExecutions({ workflowId: "wf-1", workflowExecutionId: "exec-1", filters }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["worker_executions", "wf-1", "exec-1", "ws-1"]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecutions.mockResolvedValue({
        worker_executions: [makeWorkerExecution("wex-1")],
        next_page_token: "token-2",
        parallel_index_max: 0,
    });

    const { result } = renderHook(
        () => useFetchWorkerExecutions({ workflowId: "wf-1", workflowExecutionId: "exec-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecutions.mockResolvedValue({ worker_executions: [], next_page_token: null, parallel_index_max: 0 });

    const { result } = renderHook(
        () => useFetchWorkerExecutions({ workflowId: "wf-1", workflowExecutionId: "exec-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecutions
        .mockResolvedValueOnce({ worker_executions: [makeWorkerExecution("wex-1")], next_page_token: "token-2", parallel_index_max: 0 })
        .mockResolvedValueOnce({ worker_executions: [makeWorkerExecution("wex-2")], next_page_token: null, parallel_index_max: 0 });

    const { result } = renderHook(
        () => useFetchWorkerExecutions({ workflowId: "wf-1", workflowExecutionId: "exec-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((e) => e.id)).toEqual(["wex-1", "wex-2"]);
});
