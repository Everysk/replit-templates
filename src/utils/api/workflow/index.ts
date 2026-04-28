import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "@src/types/defaultObject";
import type { FilterExpression, QueryObject } from "@src/types/entityQuery";
import type { WorkerExecution, WorkerExecutionListResponse, WorkerExecutionSingleResponse, Workflow, WorkflowExecution, WorkflowExecutionListResponse, WorkflowExecutionSingleResponse, WorkflowListResponse, WorkflowSingleResponse } from "@src/types/workflow";

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
 * Fetches a paginated list of workflows using the legacy method (workspace as query param).
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workspace - Current workspace name. Sent as a query param via the legacy method, required by some API configurations.
 * @param pageSize - Number of items per page.
 * @param pageToken - Cursor token for the next page.
 * @returns A promise that resolves with a {@link WorkflowListResponse} containing the matched workflows.
 * @throws {Error} If the request fails.
 */
export const getWorkflows = async (api: AxiosInstance, workspace?: string, pageSize?: number, pageToken?: string): Promise<WorkflowListResponse> => {
  const params: DefaultObject = {};

  if (workspace) params.workspace = workspace;
  if (pageSize) params.page_size = pageSize;
  if (pageToken) params.page_token = pageToken;

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

/**
 * Fetches a single workflow execution by ID.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workflowId - The unique identifier of the workflow.
 * @param executionId - The unique identifier of the workflow execution to fetch.
 * @param workspace - The workspace in which the workflow execution resides.
 * @returns A promise that resolves with the {@link WorkflowExecution} object.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the request fails.
 */
export const getWorkflowExecution = async (api: AxiosInstance, workflowId: string, executionId: string, workspace: string): Promise<WorkflowExecution> => {
  if (!workspace) {
    throw new Error("Workspace is required to fetch a workflow execution");
  }

  try {
    const params: DefaultObject = { workspace, workflow_execution_id: executionId };
    const response: AxiosResponse<WorkflowExecutionSingleResponse> = await api.get(`${baseUrl}/${workflowId}/workflow_executions`, { params });
    return response.data.workflow_execution;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error fetching workflow execution");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error fetching workflow execution");
  }
};

/**
 * Fetches a paginated list of workflow executions matching the given query.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workflowId - The unique identifier of the workflow whose executions to list.
 * @param query - Query object containing filters, pagination, and sorting options.
 *   Must include a `workspace` filter expression.
 * @returns A promise that resolves with a {@link WorkflowExecutionListResponse} containing the matched executions.
 * @throws {Error} If the `workspace` filter is not present in `query.filters`.
 * @throws {Error} If the request fails.
 */
export const getWorkflowExecutions = async (api: AxiosInstance, workflowId: string, query: QueryObject): Promise<WorkflowExecutionListResponse> => {
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];

  if (!workspace) throw new Error("Workspace filter is required to list workflows");

  try {
    const params: DefaultObject = {
      workspace,
      ...(query ? { query: JSON.stringify(query) } : {}),
    };

    const response: AxiosResponse<WorkflowExecutionListResponse> = await api.get(`${baseUrl}/${workflowId}/workflow_executions`, { params });
    return response.data;
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
 * Fetches a single worker execution by ID.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workflowId - The unique identifier of the parent workflow.
 * @param workerExecutionId - The unique identifier of the worker execution to fetch.
 * @param workspace - The workspace in which the worker execution resides.
 * @returns A promise that resolves with the {@link WorkerExecution} object.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the request fails.
 */
export const getWorkerExecution = async (api: AxiosInstance, workflowId: string, workerExecutionId: string, workspace: string): Promise<WorkerExecution> => {
  if (!workspace) {
    throw new Error("Workspace is required to fetch a worker execution");
  }

  try {
    const params: DefaultObject = { workspace, worker_execution_id: workerExecutionId };
    const response: AxiosResponse<WorkerExecutionSingleResponse> = await api.get(`${baseUrl}/${workflowId}/worker_executions`, { params });
    return response.data.worker_execution;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error fetching worker execution");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error fetching worker execution");
  }
}

/**
 * Fetches a paginated list of worker executions for a given workflow.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workflowId - The unique identifier of the parent workflow.
 * @param workflowExecutionId - The unique identifier of the workflow execution to filter by.
 * @param query - Query object containing filters, pagination, and sorting options.
 *   Must include a `workspace` filter expression.
 * @returns A promise that resolves with a {@link WorkerExecutionListResponse} containing the matched worker executions.
 * @throws {Error} If the `workspace` filter is not present in `query.filters`.
 * @throws {Error} If the request fails.
 */
export const getWorkerExecutions = async (api: AxiosInstance, workflowId: string, workflowExecutionId: string, query: QueryObject): Promise<WorkerExecutionListResponse> => {
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];

  if (!workspace) throw new Error("Workspace filter is required to list worker executions");

  try {
    const params: DefaultObject = {
      workspace,
      workflow_execution_id: workflowExecutionId,
      ...(query ? { query: JSON.stringify(query) } : {}),
    };

    const response: AxiosResponse<WorkerExecutionListResponse> = await api.get(`${baseUrl}/${workflowId}/worker_executions`, { params });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error listing worker executions");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error listing worker executions");
  }
};