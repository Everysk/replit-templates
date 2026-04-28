import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import usePortfolioMutations from "./usePortfolioMutations";
import type { Portfolio } from "@src/types/portfolio";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    postPortfolio: vi.fn(),
    updatePortfolio: vi.fn(),
    deletePortfolio: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/portfolio", () => ({
    postPortfolio: mocks.postPortfolio,
    updatePortfolio: mocks.updatePortfolio,
    deletePortfolio: mocks.deletePortfolio,
}));

const makePortfolio = (overrides: Partial<Portfolio> = {}): Portfolio => ({
    id: "pf-1",
    workspace: "ws-1",
    base_currency: "USD",
    date: "2024-01-01",
    securities: [],
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

beforeEach(() => vi.clearAllMocks());

describe("create", () => {
    it("calls postPortfolio with the api and data", async () => {
        const { Wrapper } = createWrapper();
        mocks.postPortfolio.mockResolvedValue(makePortfolio());

        const { result } = renderHook(() => usePortfolioMutations({ queryKey: ["portfolios"] }), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1", base_currency: "USD", date: "2024-01-01", securities: [] } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(mocks.postPortfolio).toHaveBeenCalledWith(mocks.api, expect.objectContaining({ workspace: "ws-1" }));
    });

    it("shows success alert on success", async () => {
        const { Wrapper } = createWrapper();
        mocks.postPortfolio.mockResolvedValue(makePortfolio());

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "Portfolio created successfully.",
        });
    });

    it("invalidates the queryKey on success", async () => {
        const { Wrapper, queryClient } = createWrapper();
        mocks.postPortfolio.mockResolvedValue(makePortfolio());
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => usePortfolioMutations({ queryKey: ["portfolios"] }), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["portfolios"] });
    });

    it("does not invalidate when queryKey is not provided", async () => {
        const { Wrapper, queryClient } = createWrapper();
        mocks.postPortfolio.mockResolvedValue(makePortfolio());
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
        expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.postPortfolio.mockRejectedValue(new Error("Invalid securities"));

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Invalid securities",
        });
    });

    it("shows fallback message when the thrown value is not an Error", async () => {
        const { Wrapper } = createWrapper();
        mocks.postPortfolio.mockRejectedValue("unknown");

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.create.mutate({ data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.create.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "We couldn't create the portfolio. Please review your inputs and try again.",
        });
    });
});

describe("update", () => {
    it("calls updatePortfolio with id and data and shows success alert", async () => {
        const { Wrapper } = createWrapper();
        mocks.updatePortfolio.mockResolvedValue(makePortfolio());

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.update.mutate({ id: "pf-1", data: { workspace: "ws-1", name: "Renamed" } });

        await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
        expect(mocks.updatePortfolio).toHaveBeenCalledWith(mocks.api, "pf-1", { workspace: "ws-1", name: "Renamed" });
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "Portfolio updated successfully.",
        });
    });

    it("shows fallback error message on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.updatePortfolio.mockRejectedValue("oops");

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.update.mutate({ id: "pf-1", data: { workspace: "ws-1" } });

        await waitFor(() => expect(result.current.update.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "We couldn't update the portfolio. Please try again.",
        });
    });
});

describe("remove", () => {
    it("calls deletePortfolio with id and workspace and shows success alert", async () => {
        const { Wrapper } = createWrapper();
        mocks.deletePortfolio.mockResolvedValue([]);

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.remove.mutate({ id: "pf-1", workspace: "ws-1" });

        await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
        expect(mocks.deletePortfolio).toHaveBeenCalledWith(mocks.api, "pf-1", "ws-1");
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "success",
            message: "Portfolio deleted successfully.",
        });
    });

    it("shows the Error message in the alert on failure", async () => {
        const { Wrapper } = createWrapper();
        mocks.deletePortfolio.mockRejectedValue(new Error("Not found"));

        const { result } = renderHook(() => usePortfolioMutations({}), { wrapper: Wrapper });
        result.current.remove.mutate({ id: "pf-1", workspace: "ws-1" });

        await waitFor(() => expect(result.current.remove.isError).toBe(true));
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Not found",
        });
    });
});
