import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import { buildApiQueryParams } from "../utils/apiQuery";
import { getWorkflowExecutions } from "../utils/api/workflowList";
import type { WorkflowExecution } from "../types/workflow";
import type { EntityQueryOptions, FetchEntityParams } from "../types/entityQuery";

export type FetchWorkflowExecutionsProps = Omit<FetchEntityParams<WorkflowExecution>, "id"> & {
    enabled?: boolean;
};

const defaultQueryOptions: EntityQueryOptions<WorkflowExecution[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

const useFetchWorkflowExecutions = ({
    filters = [],
    order = [],
    projection = "",
    queryOptions = defaultQueryOptions,
    enabled = true,
}: FetchWorkflowExecutionsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryFilter = buildApiQueryParams({ filters, order, projection });
    const queryKey = [
        "workflow_executions",
        ...filters.flatMap((filter) => filter.value),
    ];

    const query = useQuery<WorkflowExecution[]>({
        queryKey,
        queryFn: async () => {
            return getWorkflowExecutions(api, queryFilter);
        },
        enabled,
        ...queryOptions,
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

export default useFetchWorkflowExecutions;
