import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "../useAxios";
import useAppAlert from "../useAppAlert";
import type { Workspace } from "../../types/workspace";
import { getWorkspace } from "../../utils/api/workspace";
import type { EntityQueryOptions } from "../../types/entityQuery";

export type FetchWorkspaceProps<TData = Workspace, TSelected = TData> = {
    name: string;
    queryOptions?: EntityQueryOptions<TData, TSelected>;
};

const defaultQueryOptions: EntityQueryOptions<Workspace> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkspace
 *
 * Data-fetching hook built on TanStack Query to retrieve a single workspace by name.
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * Parameters (FetchWorkspaceProps):
 * @param {string} name
 *   Workspace name (required).
 *
 * @param queryOptions
 *   TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *
 * Returns:
 * @returns {object}
 *   TanStack Query's `query` object extended with:
 *   - `queryKey`: the cache key used by React Query
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchWorkspace({ name: "main" });
 * // data -> Workspace
 * ```
 */
const useFetchWorkspace = ({ name, queryOptions = defaultQueryOptions }: FetchWorkspaceProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["workspace", name];

    const query = useQuery<Workspace>({
        queryKey,
        queryFn: async () => {
            const workspace = await getWorkspace(api, name);
            return workspace;
        },
        ...queryOptions ?? {}
    });

    useEffect(() => {
        if (!query.error) return;

        showAlert({
            severity: "error",
            message: query.error.message,
        });
    }, [query.error, showAlert]);

    return {
        ...query,
        queryKey,
    };
};

export default useFetchWorkspace;
