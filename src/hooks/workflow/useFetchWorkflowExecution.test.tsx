import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchWorkflowExecution from "./useFetchWorkflowExecution";
import type { WorkflowExecution } from "@src/types/workflow";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    getWorkflowExecution: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/workflow", () => ({ getWorkflowExecution: mocks.getWorkflowExecution }));

const rawExecution: WorkflowExecution = {
    id: "exec-1",
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

it("calls getWorkflowExecution with the api, workflowId, workflowExecutionId and workspace", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecution.mockResolvedValue(rawExecution);

    const { result } = renderHook(
        () => useFetchWorkflowExecution({ workflowId: "wf-1", workflowExecutionId: "exec-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getWorkflowExecution).toHaveBeenCalledWith(mocks.api, "wf-1", "exec-1", "ws-1");
});

it("returns the execution from the response", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecution.mockResolvedValue(rawExecution);

    const { result } = renderHook(
        () => useFetchWorkflowExecution({ workflowId: "wf-1", workflowExecutionId: "exec-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rawExecution);
});

it("returns the correct queryKey", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecution.mockResolvedValue(rawExecution);

    const { result } = renderHook(
        () => useFetchWorkflowExecution({ workflowId: "wf-1", workflowExecutionId: "exec-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workflow_execution", "wf-1", "exec-1", "ws-1"]);
});

it("shows an error alert when the query fails", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecution.mockRejectedValue(new Error("Execution not found"));

    const { result } = renderHook(
        () => useFetchWorkflowExecution({ workflowId: "wf-1", workflowExecutionId: "exec-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Execution not found",
        })
    );
});

it("does not show an alert on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkflowExecution.mockResolvedValue(rawExecution);

    const { result } = renderHook(
        () => useFetchWorkflowExecution({ workflowId: "wf-1", workflowExecutionId: "exec-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.showAlert).not.toHaveBeenCalled();
});
