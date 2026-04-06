import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "../useAxios";
import { getFiles } from "../../utils/api/file";
import type { File, FileListResponse } from "../../types/file";
import type { FetchEntitiesParams } from "../../types/entityQuery";
import { buildQueryKey, buildQueryObject } from "../../utils/api/entityQuery";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<
    UseInfiniteQueryOptions<FileListResponse, Error, TData, QueryKey, PageToken>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export type FetchInfiniteFileProps = FetchEntitiesParams<File[], InfiniteOptions<File[]>> & {
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<File[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchFiles
 *
 * Data-fetching hook built on TanStack Query's `useInfiniteQuery` to retrieve
 * files with cursor-based pagination.
 *
 * It also:
 * - flattens all pages into a single `File[]` via `select`
 *
 * Important notes:
 * - `query.data` returns a flat `File[]` (all pages merged).
 *
 * Parameters (FetchInfiniteFileProps):
 * @param {FilterClause[]} [filters=[]]
 *   Filters applied to every page request. Must include a `workspace` filter.
 *
 * @param {string[]} [order=[]]
 *   Sorting applied to every page request.
 *
 * @param {string} [projection=""]
 *   Fields to project from the API. Omitted from the request if empty.
 *
 * @param {number} [pageSize=10]
 *   Number of files to fetch per page.
 *
 * @param {InfiniteOptions<File[]>} [queryOptions]
 *   TanStack Query options passed through to `useInfiniteQuery`
 *   (e.g., enabled, staleTime, gcTime, etc.).
 *
 * Returns:
 * @returns {object}
 *   - `query`: the full `useInfiniteQuery` result (data, isLoading, hasNextPage, fetchNextPage, etc.)
 *   - `queryKey`: the cache key used by React Query
 *
 * Example:
 * ```ts
 * const { query } = useFetchFiles({
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched files
 * const files = query.data ?? [];
 * ```
 */
export function useFetchFiles({ filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfiniteFileProps) {
    const { api } = useAxios();

    const queryKey = buildQueryKey(["files"], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<File[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<FileListResponse, Error, File[], QueryKey, PageToken>({
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

            return await getFiles(api, queryFilter);
        },

        select: (data) => data.pages.flatMap((p) => p.files),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}