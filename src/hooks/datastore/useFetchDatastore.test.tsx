import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchDatastore from "./useFetchDatastore";
import type { Datastore } from "@src/types/datastore";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    getDatastore: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/datastore", () => ({ getDatastore: mocks.getDatastore }));

const rawDatastore: Datastore = {
    id: "ds-1",
    name: "Test DS",
    workspace: "ws-1",
    data: [
        ["name", "age"],
        ["Alice", 30],
        ["Bob", null],
    ],
    date_time: "2024-01-01",
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

it("calls getDatastore with the api, id and workspace", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastore.mockResolvedValue(rawDatastore);

    const { result } = renderHook(
        () => useFetchDatastore({ id: "ds-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getDatastore).toHaveBeenCalledWith(mocks.api, "ds-1", "ws-1");
});

it("returns the datastore with rows transformed to objects", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastore.mockResolvedValue(rawDatastore);

    const { result } = renderHook(
        () => useFetchDatastore({ id: "ds-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
        id: "ds-1",
        name: "Test DS",
        data: [
            { datastoreId: "ds-1", name: "Alice", age: 30 },
            { datastoreId: "ds-1", name: "Bob", age: null },
        ],
    });
});

it("returns the correct queryKey", () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastore.mockResolvedValue(rawDatastore);

    const { result } = renderHook(
        () => useFetchDatastore({ id: "ds-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["datastore", "ds-1", "ws-1"]);
});

it("shows an error alert when the query fails", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastore.mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(
        () => useFetchDatastore({ id: "ds-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Not found",
        })
    );
});

it("does not show an alert on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastore.mockResolvedValue(rawDatastore);

    const { result } = renderHook(
        () => useFetchDatastore({ id: "ds-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.showAlert).not.toHaveBeenCalled();
});
