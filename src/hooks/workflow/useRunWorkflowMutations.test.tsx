import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import useWorkflowRunMutations from "./useRunWorkflowMutations";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    runWorkflow: vi.fn(),
    runWorkflowAndGetResult: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/workflow", () => ({
    runWorkflow: mocks.runWorkflow,
    runWorkflowAndGetResult: mocks.runWorkflowAndGetResult,
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    });
    const Wrapper = ({ children }: { children: ReactNode }) => (
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

describe("runAndGetResult", () => {
    it("calls runWorkflowAndGetResult with id, workspace, parameters and pollOptions", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowAndGetResult.mockResolvedValue({ execution: {}, workerExecution: null, result: { ok: true } });
        const pollOptions = { intervalMs: 500, timeoutMs: 10000 };

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAndGetResult.mutate({ id: "wf-1", workspace: "ws-1", parameters: { key: "val" }, pollOptions });

        await waitFor(() => expect(result.current.runAndGetResult.isSuccess).toBe(true));
        expect(mocks.runWorkflowAndGetResult).toHaveBeenCalledWith(mocks.api, "wf-1", "ws-1", { key: "val" }, pollOptions);
    });

    it("exposes the resolved result as mutation data", async () => {
        const { Wrapper } = createWrapper();
        const payload = { execution: { id: "exec-1" }, workerExecution: { id: "wex-1" }, result: { foo: "bar" } };
        mocks.runWorkflowAndGetResult.mockResolvedValue(payload);

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAndGetResult.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runAndGetResult.isSuccess).toBe(true));
        expect(result.current.runAndGetResult.data).toEqual(payload);
        expect(mocks.showAlert).not.toHaveBeenCalled();
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowAndGetResult.mockRejectedValue(new Error("Workflow execution failed"));

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAndGetResult.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runAndGetResult.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Workflow execution failed",
        });
    });

    it("shows fallback message when the thrown value is not an Error", async () => {
        const { Wrapper } = createWrapper();
        mocks.runWorkflowAndGetResult.mockRejectedValue("unknown");

        const { result } = renderHook(() => useWorkflowRunMutations(), { wrapper: Wrapper });
        result.current.runAndGetResult.mutate({ id: "wf-1", workspace: "ws-1", parameters: {} });

        await waitFor(() => expect(result.current.runAndGetResult.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to run the workflow. Please try again.",
        });
    });
});
