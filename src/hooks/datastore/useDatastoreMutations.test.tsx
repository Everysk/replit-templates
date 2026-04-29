import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useDatastoreMutations from "./useDatastoreMutations";
import type { Datastore } from "@src/types/datastore";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    postDatastore: vi.fn(),
    updateDatastore: vi.fn(),
    deleteDatastore: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({
    default: () => ({ api: mocks.api }),
}));

vi.mock("@src/hooks/useAppAlert", () => ({
    default: () => ({ showAlert: mocks.showAlert, hideAlert: vi.fn() }),
}));

vi.mock("@src/utils/api/datastore", () => ({
    postDatastore: mocks.postDatastore,
    updateDatastore: mocks.updateDatastore,
    deleteDatastore: mocks.deleteDatastore,
}));

const makeDs = (overrides: Partial<Datastore> = {}): Datastore => ({
    id: "ds-1",
    name: "Test DS",
    workspace: "ws-1",
    data: [],
    date_time: "2024-01-01",
    ...overrides,
});

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { queryClient, Wrapper };
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("create", () => {
    it("calls postDatastore with the api and data", async () => {
        const { Wrapper } = createWrapper();
        mocks.postDatastore.mockResolvedValue(makeDs());

        const { result } = renderHook(() => useDatastoreMutations({ queryKey: ["ds"] }), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1", name: "Test" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));

        expect(mocks.postDatastore).toHaveBeenCalledWith(mocks.api, { workspace: "ws-1", name: "Test" });
    });

    it("shows success alert on success", async () => {
        const { Wrapper } = createWrapper();
        mocks.postDatastore.mockResolvedValue(makeDs());

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));

        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "Datastore created successfully.",
        });
    });

    it("invalidates the queryKey on success", async () => {
        const { Wrapper, queryClient } = createWrapper();
        mocks.postDatastore.mockResolvedValue(makeDs());
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useDatastoreMutations({ queryKey: ["ds"] }), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["ds"] });
    });

    it("does not invalidate when queryKey is not provided", async () => {
        const { Wrapper, queryClient } = createWrapper();
        mocks.postDatastore.mockResolvedValue(makeDs());
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));

        expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.postDatastore.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isError).toBe(true));

        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Network error",
        });
    });

    it("shows fallback message when the thrown value is not an Error", async () => {
        const { Wrapper } = createWrapper();
        mocks.postDatastore.mockRejectedValue("something went wrong");

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isError).toBe(true));

        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to create the datastore. Please try again.",
        });
    });
});

describe("update", () => {
    it("calls updateDatastore with id and data", async () => {
        const { Wrapper } = createWrapper();
        mocks.updateDatastore.mockResolvedValue(makeDs());

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.update.mutate({ id: "ds-1", data: { workspace: "ws-1", name: "Updated" } });

        await waitFor(() => expect(result.current.update.isSuccess).toBe(true));

        expect(mocks.updateDatastore).toHaveBeenCalledWith(mocks.api, "ds-1", { workspace: "ws-1", name: "Updated" });
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "Datastore updated successfully.",
        });
    });

    it("shows fallback error message on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.updateDatastore.mockRejectedValue("oops");

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.update.mutate({ id: "ds-1", data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.update.isError).toBe(true));

        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Unable to update the datastore. Please try again.",
        });
    });
});

describe("remove", () => {
    it("calls deleteDatastore with id and workspace", async () => {
        const { Wrapper } = createWrapper();
        mocks.deleteDatastore.mockResolvedValue([]);

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.remove.mutate({ id: "ds-1", workspace: "ws-1" });

        await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));

        expect(mocks.deleteDatastore).toHaveBeenCalledWith(mocks.api, "ds-1", "ws-1");
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "Datastore deleted successfully.",
        });
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.deleteDatastore.mockRejectedValue(new Error("Not found"));

        const { result } = renderHook(() => useDatastoreMutations({}), { wrapper: Wrapper });
        result.current.remove.mutate({ id: "ds-1", workspace: "ws-1" });

        await waitFor(() => expect(result.current.remove.isError).toBe(true));

        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Not found",
        });
    });
});
