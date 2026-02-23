import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import { getWorkflows } from "../utils/api/workflowList";
import type { Workflow } from "../types/workflow";

export interface UseFetchWorkflowsProps {
    workspace?: string;
    enabled?: boolean;
    refetchInterval?: number | false;
    staleTime?: number;
}

const useFetchWorkflows = ({
    workspace,
    enabled = true,
    refetchInterval = false,
    staleTime = 10000,
}: UseFetchWorkflowsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["workflows", workspace ?? "all"];

    const query = useQuery<Workflow[]>({
        queryKey,
        queryFn: async () => {
            return getWorkflows(api, workspace);
        },
        enabled,
        refetchInterval,
        staleTime,
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
