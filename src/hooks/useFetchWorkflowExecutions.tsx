import { useEffect, useMemo } from "react";

import { useQueries } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import { getWorkflowExecutions } from "../utils/api/workflowList";
import type { WorkflowExecution } from "../types/workflow";

export interface UseFetchWorkflowExecutionsProps {
    workflowIds: string[];
    workspace: string;
    enabled?: boolean;
    refetchInterval?: number | false;
    staleTime?: number;
}

/**
 * useFetchWorkflowExecutions
 *
 * Data-fetching hook built on TanStack Query's `useQueries` to retrieve
 * executions for multiple workflows in parallel.
 *
 * It also:
 * - merges all results into a single flat `WorkflowExecution[]`
 * - triggers an error alert via `useAppAlert` for the first query error found
 *
 * @param workflowIds - List of workflow IDs to fetch executions for.
 * @param workspace - Workspace the workflows belong to.
 * @param enabled - Whether queries are enabled. Defaults to `true`.
 * @param refetchInterval - Polling interval in ms, or `false` to disable. Defaults to `false`.
 * @param staleTime - Time in ms before data is considered stale. Defaults to `10000`.
 *
 * @returns
 *   - `data`: Flat list of all `WorkflowExecution` records across all queried workflows.
 *   - `isLoading`: `true` if any query is loading.
 *   - `isFetching`: `true` if any query is fetching.
 *   - `refetch`: Function to manually refetch all queries.
 *   - `queries`: Raw array of individual `useQueries` results.
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchWorkflowExecutions({
 *   workflowIds: ["wf-1", "wf-2"],
 *   workspace: "main",
 *   refetchInterval: 5000,
 * });
 * // data -> WorkflowExecution[]
 * ```
 */
const useFetchWorkflowExecutions = ({
    workflowIds,
    workspace,
    enabled = true,
    refetchInterval = false,
    staleTime = 10000,
}: UseFetchWorkflowExecutionsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queries = useQueries({
        queries: workflowIds.map((wfId) => ({
            queryKey: ["workflow_executions", wfId],
            queryFn: async () => getWorkflowExecutions(api, wfId, workspace),
            enabled,
            refetchInterval,
            staleTime,
        })),
    });

    const firstError = queries.find((q) => q.error)?.error;

    useEffect(() => {
        if (!firstError) return;
        showAlert({
            severity: "error",
            message: firstError.message,
        });
    }, [firstError, showAlert]);

    const allExecutions: WorkflowExecution[] = useMemo(() => {
        return queries.flatMap((q) => q.data ?? []);
    }, [queries]);

    const isLoading = queries.some((q) => q.isLoading);
    const isFetching = queries.some((q) => q.isFetching);

    const refetchAll = () => {
        queries.forEach((q) => q.refetch());
    };

    return {
        data: allExecutions,
        isLoading,
        isFetching,
        refetch: refetchAll,
        queries,
    };
};

export default useFetchWorkflowExecutions;
