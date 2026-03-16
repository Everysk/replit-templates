import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "../useAxios";
import { getWorkspaces } from "../../utils/api/workspace";
import type { Workspace, WorkspaceListResponse } from "../../types/workspace";
import type { FetchEntitiesParams } from "../../types/entityQuery";
import { buildQueryKey, buildQueryObject } from "../../utils/api/entityQuery";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<
    UseInfiniteQueryOptions<WorkspaceListResponse, Error, TData, QueryKey, PageToken>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export type FetchInfiniteWorkspaceProps = FetchEntitiesParams<Workspace[], InfiniteOptions<Workspace[]>> & {
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<Workspace[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkspaces
 *
 * Data-fetching hook built on TanStack Query's `useInfiniteQuery` to retrieve
 * workspaces with cursor-based pagination.
 *
 * It also:
 * - flattens all pages into a single `Workspace[]` via `select`
 *
 * Important notes:
 * - `query.data` returns a flat `Workspace[]` (all pages merged).
 *
 * @param props - FetchInfiniteWorkspaceProps
 *   - `filters`: Filters applied to every page request. Must include a `workspace` filter.
 *   - `order`: Sorting applied to every page request.
 *   - `projection`: Fields to project from the API. Omitted from the request if empty.
 *   - `pageSize`: Number of workspaces to fetch per page.
 *   - `queryOptions`: TanStack Query options passed through to `useInfiniteQuery`.
 *
 * Returns:
 * @returns {object}
 *   - `query`: the full `useInfiniteQuery` result (data, isLoading, hasNextPage, fetchNextPage, etc.)
 *   - `queryKey`: the cache key used by React Query
 *
 * Example:
 * ```ts
 * const { query } = useFetchWorkspaces({
 *   filters: [{ field: "workspace", value: "main" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched workspaces
 * const workspaces = query.data ?? [];
 * ```
 */
export function useFetchWorkspaces({ filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfiniteWorkspaceProps) {
    const { api } = useAxios();

    const queryKey = buildQueryKey(["workspaces"], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<Workspace[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<WorkspaceListResponse, Error, Workspace[], QueryKey, PageToken>({
        queryKey,
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.next_page_token ?? undefined,

        queryFn: async ({ pageParam }) => {
            const queryFilter = buildQueryObject({
                filters,
                order,
                projection,
                pageSize,
                pageToken: pageParam ?? undefined,
            });

            return await getWorkspaces(api, queryFilter);
        },

        select: (data) => data.pages.flatMap((p) => p.workspaces),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}
