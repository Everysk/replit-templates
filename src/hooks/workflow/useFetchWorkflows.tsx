import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "../useAxios";
import { getWorkflows } from "../../utils/api/workflow";
import type { FetchEntitiesParams } from "../../types/entityQuery";
import { buildQueryKey, buildQueryObject } from "../../utils/api/entityQuery";
import type { Workflow, WorkflowListResponse } from "../../types/workflow";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<UseInfiniteQueryOptions<WorkflowListResponse, Error, TData, QueryKey, PageToken>,"queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">;

export type FetchInfiniteWorkflowProps = FetchEntitiesParams<Workflow[], InfiniteOptions<Workflow[]>> & {
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<Workflow[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkflows
 *
 * Data-fetching hook built on TanStack Query's `useInfiniteQuery` to retrieve
 * workflows with cursor-based pagination.
 *
 * Automatically flattens all pages into a single `Workflow[]` via `select`.
 *
 * Note: `query.data` returns a flat `Workflow[]` with all fetched items merged across pages.
 *
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
 *   Number of workflows to fetch per page.
 *
 * @param {InfiniteOptions<Workflow[]>} [queryOptions]
 *   TanStack Query options passed through to `useInfiniteQuery`
 *   (e.g., enabled, staleTime, gcTime, etc.).
 *
 * @returns {{ query, queryKey }}
 *   - `query`: the full `useInfiniteQuery` result (data, isLoading, hasNextPage, fetchNextPage, etc.)
 *   - `queryKey`: the cache key used by React Query
 *
 * @example
 * ```ts
 * const { query } = useFetchWorkflows({
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched workflows
 * const workflows = query.data ?? [];
 * ```
 */
export function useFetchWorkflows({ filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfiniteWorkflowProps) {
    const { api } = useAxios();

    const queryKey = buildQueryKey(["workflows"], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<Workflow[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<WorkflowListResponse, Error, Workflow[], QueryKey, PageToken>({
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

            return await getWorkflows(api, queryFilter);
        },

        select: (data) => data.pages.flatMap((p) => p.workflows),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}