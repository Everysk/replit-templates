import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import useAppAlert from "@src/hooks/useAppAlert";
import { getWorkflow } from "@src/utils/api/workflow";
import type { Workflow } from "@src/types/workflow";
import type { EntityQueryOptions, FetchEntityParams } from "@src/types/entityQuery";

export type FetchWorkflowProps<TData = Workflow, TSelected = TData> = FetchEntityParams<TData, TSelected>;

const defaultQueryOptions: EntityQueryOptions<Workflow> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}


/**
 * useFetchWorkflow
 *
 * Data-fetching hook built on TanStack Query to retrieve a single workflow by ID.
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * @param id - Workflow identifier (required).
 * @param workspace - Workspace the workflow belongs to (required).
 * @param queryOptions - TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *
 * @returns TanStack Query result extended with `queryKey`.
 *
 * Tip:
 * - The returned `queryKey` can be reused by mutation hooks for cache invalidation:
 *   ```ts
 *   const fetch = useFetchWorkflow({ id: "wf-123", workspace: "main" });
 *   useWorkflowMutations({ queryKey: fetch.queryKey });
 *   ```
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchWorkflow({ id: "wf-123", workspace: "main" });
 * // data -> Workflow
 * ```
 */
const useFetchWorkflow = ({ id, workspace, queryOptions = defaultQueryOptions }: FetchWorkflowProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["workflow", id, workspace];

    const query = useQuery<Workflow>({
        queryKey,
        queryFn: async () => {
            const workflow = await getWorkflow(api, id, workspace);
            return workflow;
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

export default useFetchWorkflow;