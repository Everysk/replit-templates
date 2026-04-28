import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import useAppAlert from "@src/hooks/useAppAlert";
import { getWorkflowExecution } from "@src/utils/api/workflow";
import type { WorkflowExecution } from "@src/types/workflow";
import type { EntityQueryOptions } from "@src/types/entityQuery";

export type FetchWorkflowExecutionProps<TData = WorkflowExecution, TSelected = TData> = {
    workflowId: string;
    workflowExecutionId: string;
    workspace: string;
    queryOptions?: EntityQueryOptions<TData, TSelected>;
};

const defaultQueryOptions: EntityQueryOptions<WorkflowExecution> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkflowExecution
 *
 * Data-fetching hook built on TanStack Query to retrieve a single workflow execution.
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * @param workflowId - Workflow identifier the execution belongs to (required).
 * @param workflowExecutionId - Workflow execution identifier (required).
 * @param workspace - Workspace the workflow belongs to (required).
 * @param queryOptions - TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *
 * @returns TanStack Query result extended with `queryKey`.
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchWorkflowExecution({
 *   workflowId: "wf-123",
 *   workflowExecutionId: "exec-456",
 *   workspace: "main",
 * });
 * // data -> WorkflowExecution
 * ```
 */
const useFetchWorkflowExecution = ({ workflowId, workflowExecutionId, workspace, queryOptions = defaultQueryOptions }: FetchWorkflowExecutionProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["workflow_execution", workflowId, workflowExecutionId, workspace];

    const query = useQuery<WorkflowExecution>({
        queryKey,
        queryFn: async () => {
            const execution = await getWorkflowExecution(api, workflowId, workflowExecutionId, workspace);
            return execution;
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

export default useFetchWorkflowExecution;
