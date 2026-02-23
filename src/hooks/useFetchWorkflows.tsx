import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import { buildApiQueryParams } from "../utils/apiQuery";
import { getWorkflows } from "../utils/api/workflowList";
import type { Workflow } from "../types/workflow";
import type { EntityQueryOptions, FetchEntityParams } from "../types/entityQuery";

export type FetchWorkflowsProps = Omit<FetchEntityParams<Workflow>, "id"> & {
    enabled?: boolean;
};

const defaultQueryOptions: EntityQueryOptions<Workflow[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

const useFetchWorkflows = ({
    filters = [],
    order = [],
    projection = "",
    queryOptions = defaultQueryOptions,
    enabled = true,
}: FetchWorkflowsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryFilter = buildApiQueryParams({ filters, order, projection });
    const queryKey = [
        "workflows",
        ...filters.flatMap((filter) => filter.value),
    ];

    const query = useQuery<Workflow[]>({
        queryKey,
        queryFn: async () => {
            return getWorkflows(api, queryFilter);
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

export default useFetchWorkflows;
