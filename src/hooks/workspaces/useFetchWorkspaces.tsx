import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import { getWorkspaces } from "@src/utils/api/workspace";
import type { Workspace, WorkspaceListResponse } from "@src/types/workspace";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<
    UseInfiniteQueryOptions<WorkspaceListResponse, Error, TData, QueryKey, PageToken>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export type FetchInfiniteWorkspaceProps = {
    workspace?: string;
    pageSize?: number;
    queryOptions?: InfiniteOptions<Workspace[]>;
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
 * - `workspace` is required by some API configurations to avoid being blocked.
 *
 * @param props - FetchInfiniteWorkspaceProps
 *   - `workspace`: Current workspace name sent as a query param.
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
 * const { query } = useFetchWorkspaces({ workspace: "main", pageSize: 20 });
 *
 * // Flat list of all fetched workspaces
 * const workspaces = query.data ?? [];
 * ```
 */
export function useFetchWorkspaces({ workspace, pageSize = 10, queryOptions }: FetchInfiniteWorkspaceProps) {
    const { api } = useAxios();

    const queryKey: QueryKey = ["workspaces", workspace ?? null];

    const mergedQueryOptions = useMemo<InfiniteOptions<Workspace[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<WorkspaceListResponse, Error, Workspace[], QueryKey, PageToken>({
        queryKey,
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.next_page_token ?? undefined,

        queryFn: async ({ pageParam }) => {
            return await getWorkspaces(api, workspace, pageSize, pageParam ?? undefined);
        },

        select: (data) => data.pages.flatMap((p) => p.workspaces),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}
