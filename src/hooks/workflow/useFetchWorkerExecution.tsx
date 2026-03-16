import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "../useAxios";
import useAppAlert from "../useAppAlert";
import { getWorkerExecution } from "../../utils/api/workflow";
import type { WorkerExecution } from "../../types/workflow";
import type { EntityQueryOptions } from "../../types/entityQuery";

export type FetchWorkerExecutionProps<TData = WorkerExecution, TSelected = TData> = {
    workflowId: string;
    workerExecutionId: string;
    workspace: string;
    queryOptions?: EntityQueryOptions<TData, TSelected>;
};

const defaultQueryOptions: EntityQueryOptions<WorkerExecution> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchWorkerExecution
 *
 * Data-fetching hook built on TanStack Query to retrieve a single worker execution.
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * @param workflowId - Workflow identifier the worker execution belongs to (required).
 * @param workerExecutionId - Worker execution identifier (required).
 * @param workspace - Workspace the workflow belongs to (required).
 * @param queryOptions - TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *
 * @returns TanStack Query result extended with `queryKey`.
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchWorkerExecution({
 *   workflowId: "wf-123",
 *   workerExecutionId: "wkex-456",
 *   workspace: "main",
 * });
 * // data -> WorkerExecution
 * ```
 */
const useFetchWorkerExecution = ({ workflowId, workerExecutionId, workspace, queryOptions = defaultQueryOptions }: FetchWorkerExecutionProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["worker_execution", workflowId, workerExecutionId, workspace];

    const query = useQuery<WorkerExecution>({
        queryKey,
        queryFn: async () => {
            return await getWorkerExecution(api, workflowId, workerExecutionId, workspace);
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

export default useFetchWorkerExecution;
