import { renderHook, act } from "@testing-library/react";
import type { InternalAxiosRequestConfig } from "axios";
import useAxios from "./index";

const captureAdapter = () => {
    const configs: InternalAxiosRequestConfig[] = [];
    const adapter = (config: InternalAxiosRequestConfig) => {
        configs.push({ ...config, params: { ...(config.params ?? {}) } });
        return Promise.resolve({ data: {}, status: 200, statusText: "OK", headers: {}, config });
    };
    return { adapter, configs };
};

it("returns an api instance", () => {
    const { result } = renderHook(() => useAxios());
    expect(result.current.api).toBeDefined();
});

it("uses /api as the default baseURL", () => {
    const { result } = renderHook(() => useAxios());
    expect(result.current.api.defaults.baseURL).toBe("/api");
});

it("uses the provided url as baseURL", () => {
    const { result } = renderHook(() => useAxios("https://custom.api.com"));
    expect(result.current.api.defaults.baseURL).toBe("https://custom.api.com");
});

it("injects workspace param from query filters on GET requests", async () => {
    const { result } = renderHook(() => useAxios());
    const { adapter, configs } = captureAdapter();

    await act(async () => {
        await result.current.api.get("/test", {
            adapter,
            params: { query: JSON.stringify({ filters: [["workspace", "ws-1"]] }) },
        });
    });

    expect(configs[0].params.workspace).toBe("ws-1");
});

it("injects workspace param from query filters on DELETE requests", async () => {
    const { result } = renderHook(() => useAxios());
    const { adapter, configs } = captureAdapter();

    await act(async () => {
        await result.current.api.delete("/test", {
            adapter,
            params: { query: JSON.stringify({ filters: [["workspace", "ws-1"]] }) },
        });
    });

    expect(configs[0].params.workspace).toBe("ws-1");
});

it("does not inject workspace on POST requests", async () => {
    const { result } = renderHook(() => useAxios());
    const { adapter, configs } = captureAdapter();

    await act(async () => {
        await result.current.api.post("/test", {}, {
            adapter,
            params: { query: JSON.stringify({ filters: [["workspace", "ws-1"]] }) },
        });
    });

    expect(configs[0].params?.workspace).toBeUndefined();
});

it("does not inject workspace when no workspace filter is present", async () => {
    const { result } = renderHook(() => useAxios());
    const { adapter, configs } = captureAdapter();

    await act(async () => {
        await result.current.api.get("/test", {
            adapter,
            params: { query: JSON.stringify({ filters: [["status", "active"]] }) },
        });
    });

    expect(configs[0].params?.workspace).toBeUndefined();
});

it("supports three-element filter expressions [field, op, value]", async () => {
    const { result } = renderHook(() => useAxios());
    const { adapter, configs } = captureAdapter();

    await act(async () => {
        await result.current.api.get("/test", {
            adapter,
            params: { query: JSON.stringify({ filters: [["workspace", "=", "ws-2"]] }) },
        });
    });

    expect(configs[0].params.workspace).toBe("ws-2");
});

it("ignores invalid JSON in query param without throwing", async () => {
    const { result } = renderHook(() => useAxios());
    const { adapter } = captureAdapter();

    await expect(
        act(async () => {
            await result.current.api.get("/test", {
                adapter,
                params: { query: "not-valid-json" },
            });
        })
    ).resolves.not.toThrow();
});

it("ejects the interceptor on unmount", () => {
    const { result, unmount } = renderHook(() => useAxios());
    const ejectSpy = vi.spyOn(result.current.api.interceptors.request, "eject");
    unmount();
    expect(ejectSpy).toHaveBeenCalledOnce();
});
