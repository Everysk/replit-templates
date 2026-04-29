import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import { getWorkerExecutions } from "@src/utils/api/workflow";
import type { FetchEntitiesParams } from "@src/types/entityQuery";
import { buildQueryKey, buildQueryObject } from "@src/utils/api/entityQuery";
import type { WorkerExecution, WorkerExecutionListResponse } from "@src/types/workflow";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<UseInfiniteQueryOptions<WorkerExecutionListResponse, Error, TData, QueryKey, PageToken>, "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">;

export type FetchInfiniteWorkerExecutionProps = FetchEntitiesParams<WorkerExecution[], InfiniteOptions<WorkerExecution[]>> & {
    workflowId: string;
    workflowExecutionId: string;
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<WorkerExecution[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkerExecutions
 *
 * Data-fetching hook built on TanStack Query's `useInfiniteQuery` to retrieve
 * worker executions for a given workflow with cursor-based pagination.
 *
 * Automatically flattens all pages into a single `WorkerExecution[]` via `select`.
 *
 * Note: `query.data` returns a flat `WorkerExecution[]` with all fetched items merged across pages.
 *
 * @param workflowId - Workflow identifier whose worker executions to fetch (required).
 * @param workflowExecutionId - Workflow execution identifier to filter worker executions (required).
 * @param filters - Filters applied to every page request. Must include a `workspace` filter.
 * @param order - Sorting applied to every page request.
 * @param projection - Fields to project from the API. Omitted from the request if empty.
 * @param pageSize - Number of executions to fetch per page. Defaults to `10`.
 * @param queryOptions - TanStack Query options passed through to `useInfiniteQuery`.
 *
 * @returns
 *   - `query`: the full `useInfiniteQuery` result (data, isLoading, hasNextPage, fetchNextPage, etc.)
 *   - `queryKey`: the cache key used by React Query
 *
 * @example
 * ```ts
 * const { query } = useFetchWorkerExecutions({
 *   workflowId: "wf-123",
 *   workflowExecutionId: "wfex-456",
 *   filters: [{ field: "workspace", value: "main" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched worker executions
 * const workerExecutions = query.data ?? [];
 * ```
 */
export function useFetchWorkerExecutions({ workflowId, workflowExecutionId, filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfiniteWorkerExecutionProps) {
    const { api } = useAxios();

    const queryKey = buildQueryKey(["worker_executions", workflowId, workflowExecutionId], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<WorkerExecution[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<WorkerExecutionListResponse, Error, WorkerExecution[], QueryKey, PageToken>({
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

            return await getWorkerExecutions(api, workflowId, workflowExecutionId, queryFilter);
        },

        select: (data) => data.pages.flatMap((p) => p.worker_executions),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}
