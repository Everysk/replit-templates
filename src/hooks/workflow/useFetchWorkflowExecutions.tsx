import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import { getWorkflowExecutions } from "@src/utils/api/workflow";
import type { FetchEntitiesParams } from "@src/types/entityQuery";
import { buildQueryKey, buildQueryObject } from "@src/utils/api/entityQuery";
import type { WorkflowExecution, WorkflowExecutionListResponse } from "@src/types/workflow";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<UseInfiniteQueryOptions<WorkflowExecutionListResponse, Error, TData, QueryKey, PageToken>, "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">;

export type FetchInfiniteWorkflowExecutionProps = FetchEntitiesParams<WorkflowExecution[], InfiniteOptions<WorkflowExecution[]>> & {
    workflowId: string;
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<WorkflowExecution[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkflowExecutions
 *
 * Data-fetching hook built on TanStack Query's `useInfiniteQuery` to retrieve
 * workflow executions for a given workflow with cursor-based pagination.
 *
 * Automatically flattens all pages into a single `WorkflowExecution[]` via `select`.
 *
 * Note: `query.data` returns a flat `WorkflowExecution[]` with all fetched items merged across pages.
 *
 * @param workflowId - Workflow identifier whose executions to fetch (required).
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
 * const { query } = useFetchWorkflowExecutions({
 *   workflowId: "wf-123",
 *   filters: [{ field: "workspace", value: "main" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched executions
 * const executions = query.data ?? [];
 * ```
 */
export function useFetchWorkflowExecutions({ workflowId, filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfiniteWorkflowExecutionProps) {
    const { api } = useAxios();

    const queryKey = buildQueryKey(["workflow_executions", workflowId], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<WorkflowExecution[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<WorkflowExecutionListResponse, Error, WorkflowExecution[], QueryKey, PageToken>({
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

            return await getWorkflowExecutions(api, workflowId, queryFilter);
        },

        select: (data) => data.pages.flatMap((p) => p.workflow_executions),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}
