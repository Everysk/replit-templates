import { QueryClient } from "@tanstack/react-query";
import { getQueryFn } from ".";

const makeFetch = (status: number, body: unknown, statusText = "") =>
    vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: vi.fn().mockResolvedValue(body),
        text: vi.fn().mockResolvedValue(""),
    });

beforeEach(() => vi.clearAllMocks());

it("fetches queryKey joined by '/' with credentials: include", async () => {
    vi.stubGlobal("fetch", makeFetch(200, { data: 1 }));

    const fn = getQueryFn({ on401: "throw" });
    await fn({ queryKey: ["api", "users", "42"], signal: new AbortController().signal, meta: undefined, client: new QueryClient() });

    expect(fetch).toHaveBeenCalledWith("api/users/42", { credentials: "include" });
});

it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", makeFetch(200, { name: "Alice" }));

    const fn = getQueryFn({ on401: "throw" });
    const result = await fn({ queryKey: ["api/users"], signal: new AbortController().signal, meta: undefined, client: new QueryClient() });

    expect(result).toEqual({ name: "Alice" });
});

it("returns null on 401 when on401 is returnNull", async () => {
    vi.stubGlobal("fetch", makeFetch(401, null));

    const fn = getQueryFn({ on401: "returnNull" });
    const result = await fn({ queryKey: ["api/me"], signal: new AbortController().signal, meta: undefined, client: new QueryClient() });

    expect(result).toBeNull();
});

it("throws on 401 when on401 is throw", async () => {
    vi.stubGlobal("fetch", makeFetch(401, null, "Unauthorized"));

    const fn = getQueryFn({ on401: "throw" });
    await expect(
        fn({ queryKey: ["api/me"], signal: new AbortController().signal, meta: undefined, client: new QueryClient() })
    ).rejects.toThrow("401");
});

it("throws with status and response text on non-ok response", async () => {
    vi.stubGlobal("fetch", {
        ...makeFetch(404, null, "Not Found"),
        mockResolvedValue: undefined,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: vi.fn().mockResolvedValue("Resource missing"),
        json: vi.fn(),
    }));

    const fn = getQueryFn({ on401: "throw" });
    await expect(
        fn({ queryKey: ["api/thing"], signal: new AbortController().signal, meta: undefined, client: new QueryClient() })
    ).rejects.toThrow("404: Resource missing");
});

it("falls back to statusText when response body is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        text: vi.fn().mockResolvedValue(""),
        json: vi.fn(),
    }));

    const fn = getQueryFn({ on401: "throw" });
    await expect(
        fn({ queryKey: ["api/thing"], signal: new AbortController().signal, meta: undefined, client: new QueryClient() })
    ).rejects.toThrow("503: Service Unavailable");
});
