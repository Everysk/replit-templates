import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchPortfolio from "./useFetchPortfolio";
import type { Portfolio } from "@src/types/portfolio";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    getPortfolio: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/portfolio", () => ({ getPortfolio: mocks.getPortfolio }));

const rawPortfolio: Portfolio = {
    id: "pf-1",
    workspace: "ws-1",
    base_currency: "USD",
    date: "2024-01-01",
    securities: [],
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

it("calls getPortfolio with the api, id and workspace", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolio.mockResolvedValue({ portfolio: rawPortfolio });

    const { result } = renderHook(
        () => useFetchPortfolio({ id: "pf-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getPortfolio).toHaveBeenCalledWith(mocks.api, "pf-1", "ws-1");
});

it("returns the portfolio from the response", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolio.mockResolvedValue({ portfolio: rawPortfolio });

    const { result } = renderHook(
        () => useFetchPortfolio({ id: "pf-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rawPortfolio);
});

it("returns the correct queryKey", () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolio.mockResolvedValue({ portfolio: rawPortfolio });

    const { result } = renderHook(
        () => useFetchPortfolio({ id: "pf-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["portfolio", "pf-1", "ws-1"]);
});

it("shows an error alert when the query fails", async () => {
    const { Wrapper } = createWrapper();
    mocks.getPortfolio.mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(
        () => useFetchPortfolio({ id: "pf-1", workspace: "ws-1" }),
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
    mocks.getPortfolio.mockResolvedValue({ portfolio: rawPortfolio });

    const { result } = renderHook(
        () => useFetchPortfolio({ id: "pf-1", workspace: "ws-1" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.showAlert).not.toHaveBeenCalled();
});
