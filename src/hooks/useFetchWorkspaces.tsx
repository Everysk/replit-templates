import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import { getWorkspaces } from "../utils/api/workflowList";
import type { Workspace } from "../types/workflow";

const useFetchWorkspaces = () => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["workspaces"];

    const query = useQuery<Workspace[]>({
        queryKey,
        queryFn: async () => {
            return getWorkspaces(api);
        },
        staleTime: 60000,
        refetchOnMount: "always",
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

export default useFetchWorkspaces;
