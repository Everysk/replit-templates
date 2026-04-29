import { AxiosError, type AxiosInstance } from "axios";
import { getPortfolio, getPortfolios, postPortfolio, updatePortfolio, deletePortfolio } from ".";

const makeApi = () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}) as unknown as AxiosInstance;

const axiosErr = (msg: string) => new AxiosError(msg);

const basePortfolio = { id: "pf-1", workspace: "ws-1", base_currency: "USD", date: "2024-01-01", securities: [] };
const baseQuery = { filters: [["workspace", "ws-1"]] as [string, string][], order: [] };

describe("getPortfolio", () => {
    it("calls GET portfolios/:id and returns the full response", async () => {
        const api = makeApi();
        const responseData = { portfolio: basePortfolio };
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: responseData });

        const result = await getPortfolio(api, "pf-1", "ws-1");

        expect(api.get).toHaveBeenCalledWith("portfolios/pf-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual(responseData);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(getPortfolio(api, "pf-1", "")).rejects.toThrow("Workspace is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Network error"));
        await expect(getPortfolio(api, "pf-1", "ws-1")).rejects.toThrow("Network error");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getPortfolio(api, "pf-1", "ws-1")).rejects.toThrow("Error while fetching portfolio");
    });
});

describe("getPortfolios", () => {
    it("calls GET portfolios with workspace and query params", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { portfolios: [], next_page_token: null } });

        await getPortfolios(api, baseQuery);

        expect(api.get).toHaveBeenCalledWith("portfolios", {
            params: expect.objectContaining({ workspace: "ws-1", query: JSON.stringify(baseQuery) }),
        });
    });

    it("throws when workspace filter is missing", async () => {
        const api = makeApi();
        await expect(getPortfolios(api, { filters: [], order: [] })).rejects.toThrow("Workspace is required");
        expect(api.get).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Timeout"));
        await expect(getPortfolios(api, baseQuery)).rejects.toThrow("Timeout");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.get as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(getPortfolios(api, baseQuery)).rejects.toThrow("Error while fetching portfolios");
    });
});

describe("postPortfolio", () => {
    it("calls POST portfolios and returns the response data", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: basePortfolio });

        const result = await postPortfolio(api, { workspace: "ws-1", base_currency: "USD" });

        expect(api.post).toHaveBeenCalledWith("portfolios", { workspace: "ws-1", base_currency: "USD" });
        expect(result).toEqual(basePortfolio);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(postPortfolio(api, { base_currency: "USD" })).rejects.toThrow("Workspace is required");
        expect(api.post).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Conflict"));
        await expect(postPortfolio(api, { workspace: "ws-1" })).rejects.toThrow("Conflict");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.post as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(postPortfolio(api, { workspace: "ws-1" })).rejects.toThrow("Error while creating portfolio");
    });
});

describe("updatePortfolio", () => {
    it("calls PUT portfolios/:id and returns the response data", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: basePortfolio });

        const result = await updatePortfolio(api, "pf-1", { workspace: "ws-1", base_currency: "BRL" });

        expect(api.put).toHaveBeenCalledWith("portfolios/pf-1", { workspace: "ws-1", base_currency: "BRL" });
        expect(result).toEqual(basePortfolio);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(updatePortfolio(api, "pf-1", { base_currency: "BRL" })).rejects.toThrow("Workspace is required");
        expect(api.put).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Not found"));
        await expect(updatePortfolio(api, "pf-1", { workspace: "ws-1" })).rejects.toThrow("Not found");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.put as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(updatePortfolio(api, "pf-1", { workspace: "ws-1" })).rejects.toThrow("Error while updating portfolio");
    });
});

describe("deletePortfolio", () => {
    it("calls DELETE portfolios/:id and returns the response data", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: basePortfolio });

        const result = await deletePortfolio(api, "pf-1", "ws-1");

        expect(api.delete).toHaveBeenCalledWith("portfolios/pf-1", { params: { workspace: "ws-1" } });
        expect(result).toEqual(basePortfolio);
    });

    it("throws when workspace is missing", async () => {
        const api = makeApi();
        await expect(deletePortfolio(api, "pf-1", "")).rejects.toThrow("Workspace is required");
        expect(api.delete).not.toHaveBeenCalled();
    });

    it("re-wraps AxiosError", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockRejectedValue(axiosErr("Forbidden"));
        await expect(deletePortfolio(api, "pf-1", "ws-1")).rejects.toThrow("Forbidden");
    });

    it("throws fallback for unknown errors", async () => {
        const api = makeApi();
        (api.delete as ReturnType<typeof vi.fn>).mockRejectedValue("oops");
        await expect(deletePortfolio(api, "pf-1", "ws-1")).rejects.toThrow("Error while deleting portfolio");
    });
});
