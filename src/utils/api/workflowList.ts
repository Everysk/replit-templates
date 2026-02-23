import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { Workflow, WorkflowExecution } from "../../types/workflow";
import type { DefaultObject } from "../../types/defaultObject";

const workflowsBaseUrl = "workflows";
const executionsBaseUrl = "workflow_executions";

export const getWorkflows = async (api: AxiosInstance, query: DefaultObject): Promise<Workflow[]> => {
    const params: DefaultObject = {
        ...(query ? { query: JSON.stringify(query) } : {}),
    };

    try {
        const response: AxiosResponse<DefaultObject> = await api.get(workflowsBaseUrl, { params });
        return response.data?.workflows ?? [];
    } catch (error: unknown) {
        if (isAxiosError<DefaultObject>(error)) {
            throw new Error(error.message || "Error listing workflows");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Error listing workflows");
    }
};

export const getWorkflowExecutions = async (api: AxiosInstance, query: DefaultObject): Promise<WorkflowExecution[]> => {
    const params: DefaultObject = {
        ...(query ? { query: JSON.stringify(query) } : {}),
    };

    try {
        const response: AxiosResponse<DefaultObject> = await api.get(executionsBaseUrl, { params });
        return response.data?.workflow_executions ?? [];
    } catch (error: unknown) {
        if (isAxiosError<DefaultObject>(error)) {
            throw new Error(error.message || "Error listing workflow executions");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Error listing workflow executions");
    }
};
