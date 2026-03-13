import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "../../types/defaultObject";
import type { Workflow, WorkflowListResponse, WorkflowSingleResponse } from "../../types/workflow";
import type { FilterExpression, QueryObject } from "../../types/entityQuery";

const baseUrl = "workflows";

/**
 * Runs a workflow asynchronously.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param id - The unique identifier of the workflow to run.
 * @param workspace - The workspace in which the workflow will be executed.
 * @param parameters - Key-value parameters to pass to the workflow.
 * @returns A promise that resolves with the workflow execution response data.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the workflow execution status is "FAILED" or if the request fails.
 */
export const runWorkflow = async (api: AxiosInstance, id: string, workspace: string, parameters: DefaultObject): Promise<DefaultObject> => {
  
  if (!workspace) {
    throw new Error("Workspace is required to run workflow");
  } 

  try {
    const body: DefaultObject = {
      workspace,
      parameters,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: AxiosResponse<any> = await api.post(`${baseUrl}/${id}/run`, body);

    if (response.data.workflow_execution?.run_status === "FAILED") {
      throw new Error("Error while running workflow");
    }

    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while running workflow");
  }
};

/**
 * Runs a workflow synchronously, waiting for execution to complete before returning.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param id - The unique identifier of the workflow to run.
 * @param workspace - The workspace in which the workflow will be executed.
 * @param parameters - Key-value parameters to pass to the workflow.
 * @returns A promise that resolves with the workflow execution response data.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the workflow execution status is "FAILED" or if the request fails.
 */
export const runWorkflowSync = async (api: AxiosInstance, id: string, workspace: string, parameters: DefaultObject): Promise<DefaultObject> => {
  
  if (!workspace){
    throw new Error("Workspace is required to run workflow");
  }
  
  try {
    const body: DefaultObject = {
      workspace,
      synchronous: true,
      parameters,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: AxiosResponse<any> = await api.post(`${baseUrl}/${id}/run`, body);

    if (response.data.workflow_execution?.run_status === "FAILED") {
      throw new Error("Error while running workflow");
    }

    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while running workflow");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while running workflow");
  }
};

/**
 * Fetches a single workflow by ID.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param id - The unique identifier of the workflow to fetch.
 * @param workspace - The workspace in which the workflow resides.
 * @returns A promise that resolves with the {@link Workflow} object.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the request fails.
 */
export const getWorkflow = async (api: AxiosInstance, id: string, workspace: string): Promise<Workflow> => {
  if (!workspace) {
    throw new Error("Workspace is required to fetch a workflow");
  }
  
  try {
    const params: DefaultObject = { workspace };
    const response: AxiosResponse<WorkflowSingleResponse> = await api.get(`${baseUrl}/${id}`, { params });

    return response.data.workflow;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while fetching workflow");
    } 
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while fetching workflow");
  }
};

/**
 * Fetches a paginated list of workflows matching the given query.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param query - Query object containing filters, pagination, and sorting options.
 *   Must include a `workspace` filter expression.
 * @returns A promise that resolves with a {@link WorkflowListResponse} containing the matched workflows.
 * @throws {Error} If the `workspace` filter is not present in `query.filters`.
 * @throws {Error} If the request fails.
 */
export const getWorkflows = async (api: AxiosInstance, query: QueryObject): Promise<WorkflowListResponse> => { 
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];

  if (!workspace) throw new Error("Workspace filter is required to list workflows");

  const params: DefaultObject = {
    workspace,
    ...(query ? { query: JSON.stringify(query) } : {}),
  };

  try {
    const response: AxiosResponse<WorkflowListResponse> = await api.get(baseUrl, { params });
    return response.data;
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