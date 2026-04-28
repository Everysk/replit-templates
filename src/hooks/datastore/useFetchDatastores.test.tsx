import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchDatastores } from "./useFetchDatastores";
import type { Datastore } from "@src/types/datastore";

const mocks = vi.hoisted(() => ({
    api: {},
    getDatastores: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/datastore", () => ({ getDatastores: mocks.getDatastores }));

const makeDs = (id: string): Datastore => ({
    id,
    name: `Datastore ${id}`,
    workspace: "ws-1",
    data: [["col"], ["val"]],
    date_time: "2024-01-01",
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

it("calls getDatastores and returns transformed datastores", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastores.mockResolvedValue({
        datastores: [makeDs("ds-1"), makeDs("ds-2")],
        next_page_token: null,
    });

    const { result } = renderHook(
        () => useFetchDatastores({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0]).toMatchObject({
        id: "ds-1",
        data: [{ datastoreId: "ds-1", col: "val" }],
    });
});

it("returns the correct queryKey for the given filters", () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastores.mockResolvedValue({ datastores: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchDatastores({ filters }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["datastores", "ws-1"]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastores.mockResolvedValue({
        datastores: [makeDs("ds-1")],
        next_page_token: "token-2",
    });

    const { result } = renderHook(
        () => useFetchDatastores({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastores.mockResolvedValue({ datastores: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchDatastores({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getDatastores
        .mockResolvedValueOnce({ datastores: [makeDs("ds-1")], next_page_token: "token-2" })
        .mockResolvedValueOnce({ datastores: [makeDs("ds-2")], next_page_token: null });

    const { result } = renderHook(
        () => useFetchDatastores({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((d) => d.id)).toEqual(["ds-1", "ds-2"]);
});
