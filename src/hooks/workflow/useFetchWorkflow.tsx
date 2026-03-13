import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "../useAxios";
import useAppAlert from "../useAppAlert";
import { getWorkflow } from "../../utils/api/workflow";
import type { Workflow } from "../../types/workflow";
import type { EntityQueryOptions, FetchEntityParams } from "../../types/entityQuery";

export type FetchWorkflowProps<TData = Workflow, TSelected = TData> = FetchEntityParams<TData, TSelected>;

const defaultQueryOptions: EntityQueryOptions<Workflow> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}


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