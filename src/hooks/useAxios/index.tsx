import { useEffect, useMemo, useRef } from "react";

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import type { DefaultObject } from "../../types/defaultObject";
import type { FilterExpression } from "../../types/entityQuery";

/**
 * useAxios
 *
 * Axios client hook that returns a memoized `AxiosInstance` configured with:
 * - `baseURL` derived from:
 *   - the optional `url` parameter, or
 *   - `${import.meta.env.VITE_API_URL}/api` as default (normalized to ensure proper slashes).
 *
 * Request behavior:
 * - Registers a request interceptor that, for `GET` and `DELETE` requests, attempts to parse
 *   `config.params.query` (expected to be a JSON string) and extract a `workspace` filter from it.
 * - If a `workspace` value is found, it is injected into `config.params.workspace`.
 *
 * Lifecycle / cleanup:
 * - The interceptor is attached in `useEffect` and ejected on cleanup to avoid stacking interceptors
 *   across re-renders or unmount/mount cycles.
 *
 * Notes:
 * - `params.query` parsing is best-effort. Invalid JSON is ignored.
 * - This hook assumes a query structure containing `filters`, where the workspace filter is identified by
 *   `filter[0] === "workspace"`.
 *
 * Parameters:
 * @param {string | null} [url=null]
 *  Optional base URL override. If omitted/null, defaults to `${VITE_API_URL}/api`.
 *
 * Return value:
 * @returns {{ api: AxiosInstance }}
 *  Returns an object containing the configured Axios instance.
 */

const useAxios = (url: string | null = null) => {

    const reqInterceptorId = useRef<number | null>(null);

    const api: AxiosInstance = useMemo(() => axios.create({
        baseURL: url ?? "/api",
    }), [url]);

    useEffect(() => {
        reqInterceptorId.current = api.interceptors.request.use(
            (config: InternalAxiosRequestConfig<DefaultObject>) => {
                const method = (config.method ?? "").toLowerCase();

                if (method === "get" || method === "delete") {
                    const params = (config.params ?? {}) as Record<string, unknown>;

                    try {
                        const rawQuery = params.query;
                        const queryObj = typeof rawQuery === "string" ? JSON.parse(rawQuery) : null;

                        const workspaceFilter = queryObj?.filters?.find(
                            (filter: FilterExpression) => filter?.[0] === "workspace"
                        );

                        const workspace =
                            Array.isArray(workspaceFilter) ? workspaceFilter[workspaceFilter.length - 1] : null;

                        if (workspace) {
                            config.params = { ...params, workspace };
                        }
                    } catch {
                        // ignore invalid query JSON
                    }
                }

                return config;
            }
        );

        return () => {
            if (reqInterceptorId.current != null) {
                api.interceptors.request.eject(reqInterceptorId.current);
            }
            reqInterceptorId.current = null;
        };
    }, [api]);

    return { api };
};

export default useAxios;
