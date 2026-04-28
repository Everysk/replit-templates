import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useWorkflowRunMutations from "./useRunWorkflowMutations";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    runWorkflow: vi.fn(),
    runWorkflowSync: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/workflow", () => ({
    runWorkflow: mocks.runWorkflow,
    runWorkflowSync: mocks.runWorkflowSync,
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { Wrapper };
};

beforeEach(() => vi.clearAllMocks());

describe("runAsync", () => {
    it("calls runWorkflow with id, workspace and parameters", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflow.mockResolvedValue({ execution_id: "exec-1" });

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAsync.mutate({ id: "wf-1", workspace: "ws-1", parameters: { key: "val" } });

        await waitFor(() => expect(result.current.runAsync.isSuccess).toBe(true));
        expect(mocks.runWorkflow).toHaveBeenCalledWith(mocks.api, "wf-1", "ws-1", { key: "val" });
    });

    it("does not show a success alert on success", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflow.mockResolvedValue({ execution_id: "exec-1" });

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAsync.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runAsync.isSuccess).toBe(true));
        expect(mocks.showAlert).not.toHaveBeenCalled();
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflow.mockRejectedValue(new Error("Workflow not found"));

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAsync.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runAsync.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Workflow not found",
        });
    });

    it("shows fallback message when the thrown value is not an Error", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflow.mockRejectedValue("unknown");

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAsync.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runAsync.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to run the workflow. Please try again.",
        });
    });
});

describe("runSync", () => {
    it("calls runWorkflowSync with id, workspace and parameters", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowSync.mockResolvedValue({ result: "ok" });

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runSync.mutate({ id: "wf-1", workspace: "ws-1", parameters: { key: "val" } });

        await waitFor(() => expect(result.current.runSync.isSuccess).toBe(true));
        expect(mocks.runWorkflowSync).toHaveBeenCalledWith(mocks.api, "wf-1", "ws-1", { key: "val" });
    });

    it("does not show a success alert on success", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowSync.mockResolvedValue({ result: "ok" });

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runSync.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runSync.isSuccess).toBe(true));
        expect(mocks.showAlert).not.toHaveBeenCalled();
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowSync.mockRejectedValue(new Error("Execution timeout"));

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runSync.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runSync.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Execution timeout",
        });
    });

    it("shows fallback message when the thrown value is not an Error", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowSync.mockRejectedValue("unknown");

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runSync.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runSync.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to run the workflow. Please try again.",
        });
    });
});
