import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFetchPortfolios } from "./useFetchPortfolios";
import type { Portfolio } from "@src/types/portfolio";

const mocks = vi.hoisted(() => ({
    api: {},
    getPortfolios: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/utils/api/portfolio", () => ({ getPortfolios: mocks.getPortfolios }));

const makePortfolio = (id: string): Portfolio => ({
    id,
    workspace: "ws-1",
    base_currency: "USD",
    date: "2024-01-01",
    securities: [],
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

it("calls getPortfolios and returns the portfolios on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolios.mockResolvedValue({
        portfolios: [makePortfolio("pf-1"), makePortfolio("pf-2")],
        next_page_token: null,
    });

    const { result } = renderHook(
        () => useFetchPortfolios({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toHaveLength(2);
    expect(result.current.query.data?.[0].id).toBe("pf-1");
});

it("returns the correct queryKey for the given filters", () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolios.mockResolvedValue({ portfolios: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchPortfolios({ filters }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["portfolios", "ws-1"]);
});

it("hasNextPage is true when next_page_token is present", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolios.mockResolvedValue({
        portfolios: [makePortfolio("pf-1")],
        next_page_token: "token-2",
    });

    const { result } = renderHook(
        () => useFetchPortfolios({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(true);
});

it("hasNextPage is false when next_page_token is null", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolios.mockResolvedValue({ portfolios: [], next_page_token: null });

    const { result } = renderHook(
        () => useFetchPortfolios({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.hasNextPage).toBe(false);
});

it("fetchNextPage flattens all pages into a single array", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolios
        .mockResolvedValueOnce({ portfolios: [makePortfolio("pf-1")], next_page_token: "token-2" })
        .mockResolvedValueOnce({ portfolios: [makePortfolio("pf-2")], next_page_token: null });

    const { result } = renderHook(
        () => useFetchPortfolios({ filters }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => { result.current.query.fetchNextPage(); });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.map((p) => p.id)).toEqual(["pf-1", "pf-2"]);
});
