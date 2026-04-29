import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import { getWorkflows } from "@src/utils/api/workflow";
import type { Workflow, WorkflowListResponse } from "@src/types/workflow";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<UseInfiniteQueryOptions<WorkflowListResponse, Error, TData, QueryKey, PageToken>,"queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">;

export type FetchInfiniteWorkflowProps = {
    workspace?: string;
    pageSize?: number;
    queryOptions?: InfiniteOptions<Workflow[]>;
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
 * workflows with cursor-based pagination using the legacy method (workspace as query param).
 *
 * Automatically flattens all pages into a single `Workflow[]` via `select`.
 *
 * Note: `query.data` returns a flat `Workflow[]` with all fetched items merged across pages.
 *
 * @param {string} [workspace]
 *   Current workspace name. Sent as a query param via the legacy method, required by some API configurations.
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
 * const { query } = useFetchWorkflows({ workspace: "ws-1", pageSize: 20 });
 *
 * // Flat list of all fetched workflows
 * const workflows = query.data ?? [];
 * ```
 */
export function useFetchWorkflows({ workspace, pageSize = 10, queryOptions }: FetchInfiniteWorkflowProps) {
    const { api } = useAxios();

    const queryKey: QueryKey = ["workflows", workspace ?? null];

    const mergedQueryOptions = useMemo<InfiniteOptions<Workflow[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<WorkflowListResponse, Error, Workflow[], QueryKey, PageToken>({
        queryKey,
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.next_page_token ?? undefined,

        queryFn: async ({ pageParam }) => {
            return await getWorkflows(api, workspace, pageSize, pageParam ?? undefined);
        },

        select: (data) => data.pages.flatMap((p) => p.workflows),

        ...mergedQueryOptions,
    });

    return {
        query,
        queryKey,
    };
}
