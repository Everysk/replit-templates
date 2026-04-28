import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchWorkerExecution from "./useFetchWorkerExecution";
import type { WorkerExecution } from "@src/types/workflow";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    getWorkerExecution: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/workflow", () => ({ getWorkerExecution: mocks.getWorkerExecution }));

const rawWorkerExecution: WorkerExecution = {
    id: "wex-1",
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

it("calls getWorkerExecution with the api, workflowId, workerExecutionId and workspace", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecution.mockResolvedValue(rawWorkerExecution);

    const { result } = renderHook(
        () => useFetchWorkerExecution({ workflowId: "wf-1", workerExecutionId: "wex-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getWorkerExecution).toHaveBeenCalledWith(mocks.api, "wf-1", "wex-1", "ws-1");
});

it("returns the worker execution from the response", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecution.mockResolvedValue(rawWorkerExecution);

    const { result } = renderHook(
        () => useFetchWorkerExecution({ workflowId: "wf-1", workerExecutionId: "wex-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rawWorkerExecution);
});

it("returns the correct queryKey", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecution.mockResolvedValue(rawWorkerExecution);

    const { result } = renderHook(
        () => useFetchWorkerExecution({ workflowId: "wf-1", workerExecutionId: "wex-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["worker_execution", "wf-1", "wex-1", "ws-1"]);
});

it("shows an error alert when the query fails", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecution.mockRejectedValue(new Error("Worker execution not found"));

    const { result } = renderHook(
        () => useFetchWorkerExecution({ workflowId: "wf-1", workerExecutionId: "wex-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Worker execution not found",
        })
    );
});

it("does not show an alert on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkerExecution.mockResolvedValue(rawWorkerExecution);

    const { result } = renderHook(
        () => useFetchWorkerExecution({ workflowId: "wf-1", workerExecutionId: "wex-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.showAlert).not.toHaveBeenCalled();
});
