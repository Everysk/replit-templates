import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchWorkflowExecutions } from "./useFetchWorkflowExecutions";
import type { WorkflowExecution } from "@src/types/workflow";

const mocks = vi.hoisted(() => ({
    api: {},
    getWorkflowExecutions: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/workflow", () => ({ getWorkflowExecutions: mocks.getWorkflowExecutions }));

const makeExecution = (id: string): WorkflowExecution => ({
    id,
    workflow_id: "wf-1",
    workflow_name: "My Workflow",
    workspace: "ws-1",
    status: "completed",
    run_status: "success",
    duration: 1000,
    real_execution_time: 900,
    total_execution_time: 1000,
    started: 0,
    created: 0,
    updated: 0,
    trigger: "manual",
    started_worker_id: "w-1",
    ender_worker_id: "w-2",
    ender_worker_execution_id: "wex-1",
    resume: null,
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

it("calls getWorkflowExecutions and returns the executions on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecutions.mockResolvedValue({
        workflow_executions: [makeExecution("exec-1"), makeExecution("exec-2")],
        next_page_token: null,
    });

    const { result } = renderHook(
        () => useFetchWorkflowExecutions({ workflowId: "wf-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0].id).toBe("exec-1");
});

it("returns the correct queryKey for the given workflowId and filters", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecutions.mockResolvedValue({ workflow_executions: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflowExecutions({ workflowId: "wf-1", filters }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workflow_executions", "wf-1", "ws-1"]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecutions.mockResolvedValue({
        workflow_executions: [makeExecution("exec-1")],
        next_page_token: "token-2",
    });

    const { result } = renderHook(
        () => useFetchWorkflowExecutions({ workflowId: "wf-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecutions.mockResolvedValue({ workflow_executions: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflowExecutions({ workflowId: "wf-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecutions
        .mockResolvedValueOnce({ workflow_executions: [makeExecution("exec-1")], next_page_token: "token-2" })
        .mockResolvedValueOnce({ workflow_executions: [makeExecution("exec-2")], next_page_token: null });

    const { result } = renderHook(
        () => useFetchWorkflowExecutions({ workflowId: "wf-1", filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((e) => e.id)).toEqual(["exec-1", "exec-2"]);
});
