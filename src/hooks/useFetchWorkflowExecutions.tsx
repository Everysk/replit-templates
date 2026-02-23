import { useEffect, useMemo } from "react";

import { useQueries } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import { getWorkflowExecutions } from "../utils/api/workflowList";
import type { WorkflowExecution } from "../types/workflow";

export interface UseFetchWorkflowExecutionsProps {
    workflowIds: string[];
    enabled?: boolean;
    refetchInterval?: number | false;
    staleTime?: number;
}

const useFetchWorkflowExecutions = ({
    workflowIds,
    enabled = true,
    refetchInterval = false,
    staleTime = 10000,
}: UseFetchWorkflowExecutionsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queries = useQueries({
        queries: workflowIds.map((wfId) => ({
            queryKey: ["workflow_executions", wfId],
            queryFn: async () => getWorkflowExecutions(api, wfId),
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
