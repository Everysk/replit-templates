import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "../useAxios";
import { getPortfolios } from "../../utils/api/portfolio";
import type { FetchEntitiesParams } from "../../types/entityQuery";
import type { Portfolio, PortfolioListResponse } from "../../types/portfolio";
import { buildQueryKey, buildQueryObject } from "../../utils/api/entityQuery";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<
    UseInfiniteQueryOptions<PortfolioListResponse, Error, TData, QueryKey, PageToken>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export type FetchInfinitePortfolioProps = FetchEntitiesParams<Portfolio[], InfiniteOptions<Portfolio[]>> & {
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<Portfolio[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchInfiniteFile
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
 * const { query } = useFetchInfiniteFile({
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched files
 * const files = query.data ?? [];
 * ```
 */
export function useFetchPortfolios({ filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfinitePortfolioProps) {
    const { api } = useAxios();

    const queryKey = buildQueryKey(["portfolios"], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<Portfolio[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<PortfolioListResponse, Error, Portfolio[], QueryKey, PageToken>({
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

            return await getPortfolios(api, queryFilter);
        },

        select: (data) => data.pages.flatMap((p) => p.portfolios),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}