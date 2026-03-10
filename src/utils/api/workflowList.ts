import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { Workspace, Workflow, WorkflowExecution } from "../../types/workflow";
import type { DefaultObject } from "../../types/defaultObject";

const workspacesBaseUrl = "workspaces";
const workflowsBaseUrl = "workflows";

export const getWorkspaces = async (api: AxiosInstance): Promise<Workspace[]> => {
    try {
        const response: AxiosResponse<DefaultObject> = await api.get(workspacesBaseUrl, {
            params: { page_size: 1000 },
        });
        return response.data?.workspaces ?? [];
    } catch (error: unknown) {
        if (isAxiosError<DefaultObject>(error)) {
            throw new Error(error.message || "Error listing workspaces");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Error listing workspaces");
    }
};

export const getWorkflows = async (api: AxiosInstance, workspace?: string): Promise<Workflow[]> => {
    const params: Record<string, string | number> = { page_size: 20 };
    if (workspace) {
        params.workspace = workspace;
    }

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

export const getWorkflowExecutions = async (api: AxiosInstance, workflowId: string): Promise<WorkflowExecution[]> => {
    try {
        const response: AxiosResponse<DefaultObject> = await api.get(
            `${workflowsBaseUrl}/${workflowId}/workflow_executions`,
            { params: { page_size: 20 } }
        );
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
