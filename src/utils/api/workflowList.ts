import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "../../types/defaultObject";
import type { Workflow, WorkflowExecution } from "../../types/workflow";
import type { Workspace } from "../../types/workspace";

const baseUrl = "workflows";
const workspacesBaseUrl = "workspaces";

/**
 * Fetches a list of workflows for the given workspace.
 *
 * @deprecated Use `getWorkflows` from `./workflow` instead, which supports
 *   full query filtering, pagination, and sorting via a {@link QueryObject}.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workspace - The workspace whose workflows to list.
 * @returns A promise that resolves with an array of {@link Workflow} objects.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the request fails.
 */
export const getWorkflows = async (api: AxiosInstance, workspace: string): Promise<Workflow[]> => {
    
    if(!workspace) {
        throw new Error("Workspace filter is required to list workflows");
    }
    
    try {
        const params: Record<string, string | number> = { page_size: 20, workspace };
        const response: AxiosResponse<DefaultObject> = await api.get(baseUrl, { params });
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

/**
 * Fetches a list of executions for a given workflow and workspace.
 *
 * @deprecated Use `getWorkflowExecutions` from `./workflow` instead, which supports
 *   full query filtering, pagination, and sorting via a {@link QueryObject}.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workflowId - The unique identifier of the workflow whose executions to list.
 * @param workspace - The workspace in which the workflow resides.
 * @returns A promise that resolves with an array of {@link WorkflowExecution} objects.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the request fails.
 */
export const getWorkflowExecutions = async (api: AxiosInstance, workflowId: string, workspace: string): Promise<WorkflowExecution[]> => {
    if(!workspace) {
        throw new Error("Workspace filter is required to list workflow executions");
    }

    try {
        const response: AxiosResponse<DefaultObject> = await api.get(
            `${baseUrl}/${workflowId}/workflow_executions`,
            { params: { page_size: 20, workspace } }
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

/**
 * Fetches a list of all available workspaces.
 *
 * @deprecated Use `getWorkspaces` from `./workspace` instead.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @returns A promise that resolves with an array of {@link Workspace} objects.
 * @throws {Error} If the request fails.
 */
export const getWorkspaces = async (api: AxiosInstance, workspace: string = "main"): Promise<Workspace[]> => {

    if(!workspace) {
        throw new Error("Workspace filter is required to list workspaces");
    }

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
