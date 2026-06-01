import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "@src/types/defaultObject";
import type { FilterExpression, QueryObject } from "@src/types/entityQuery";
import type { WorkerExecution, WorkerExecutionListResponse, WorkerExecutionSingleResponse, Workflow, WorkflowExecution, WorkflowExecutionListResponse, WorkflowExecutionSingleResponse, WorkflowListResponse, WorkflowSingleResponse } from "@src/types/workflow";

const baseUrl = "workflows";

/**
 * Runs a workflow asynchronously.
 *
 * Starts the workflow in a non-blocking way: the response carries a workflow execution
 * with a non-terminal status (e.g. "RUNNING"). Use polling to wait for the terminal state.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param id - The unique identifier of the workflow to run.
 * @param workspace - The workspace in which the workflow will be executed.
 * @param parameters - Key-value parameters to pass to the workflow.
 * @returns A promise that resolves with the workflow execution response data.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the request fails.
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
 * Run statuses that indicate a workflow execution has reached a terminal state
 * (i.e. it is no longer running and will not change again).
 *
 * Mirrors the backend's `WORKFLOW_EXECUTION_STATUS_FINISHED` set.
 */
export const TERMINAL_RUN_STATUSES = ["CANCELED", "COMPLETED", "SUCCEEDED", "FAILED"] as const;

const isTerminalRunStatus = (runStatus: unknown): boolean =>
  TERMINAL_RUN_STATUSES.includes(String(runStatus ?? "").toUpperCase() as (typeof TERMINAL_RUN_STATUSES)[number]);

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export type PollWorkflowExecutionOptions = {
  /** Delay between status checks, in milliseconds. Defaults to 2000ms. */
  intervalMs?: number;
  /** Maximum time to wait for a terminal status before giving up, in milliseconds. Defaults to 5 minutes. */
  timeoutMs?: number;
  /** Optional abort signal to cancel polling (e.g. on unmount). */
  signal?: AbortSignal;
};

/**
 * Polls a workflow execution until it reaches a terminal run status (see {@link TERMINAL_RUN_STATUSES}).
 *
 * This is the interim, non-blocking replacement for synchronous (`synchronous: true`) execution:
 * the workflow is started asynchronously and its status is checked periodically until it completes.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param workflowId - The unique identifier of the workflow.
 * @param executionId - The unique identifier of the workflow execution to poll.
 * @param workspace - The workspace in which the workflow execution resides.
 * @param options - Polling configuration (interval, timeout, abort signal).
 * @returns A promise that resolves with the terminal {@link WorkflowExecution}.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If polling is aborted via `options.signal`.
 * @throws {Error} If a terminal status is not reached before `options.timeoutMs` elapses.
 */
export const pollWorkflowExecution = async (
  api: AxiosInstance,
  workflowId: string,
  executionId: string,
  workspace: string,
  options: PollWorkflowExecutionOptions = {}
): Promise<WorkflowExecution> => {
  if (!workspace) {
    throw new Error("Workspace is required to poll a workflow execution");
  }

  const { intervalMs = 2000, timeoutMs = 5 * 60 * 1000, signal } = options;
  const startedAt = Date.now();

  while (true) {
    if (signal?.aborted) {
      throw new Error("Workflow execution polling was aborted");
    }

    const execution = await getWorkflowExecution(api, workflowId, executionId, workspace);

    if (isTerminalRunStatus(execution.run_status)) {
      return execution;
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error("Timed out while waiting for the workflow execution to complete");
    }

    await sleep(intervalMs);
  }
};

/**
 * Starts a workflow asynchronously and polls its execution until completion.
 *
 * Interim replacement for synchronous execution: instead of holding the request open with
 * `synchronous: true`, the workflow is started in a non-blocking way and its status is polled
 * until it reaches a terminal state, at which point the final execution (with its result) is returned.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param id - The unique identifier of the workflow to run.
 * @param workspace - The workspace in which the workflow will be executed.
 * @param parameters - Key-value parameters to pass to the workflow.
 * @param options - Polling configuration (interval, timeout, abort signal).
 * @returns A promise that resolves with the terminal {@link WorkflowExecution}.
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the run response does not contain a workflow execution id.
 * @throws {Error} If the workflow execution ends in a "FAILED" run status.
 * @throws {Error} If polling times out or is aborted.
 */
const runWorkflowAndPoll = async (
  api: AxiosInstance,
  id: string,
  workspace: string,
  parameters: DefaultObject,
  options: PollWorkflowExecutionOptions = {}
): Promise<WorkflowExecution> => {
  if (!workspace) {
    throw new Error("Workspace is required to run workflow");
  }

  // Start the workflow asynchronously (non-blocking).
  const startResponse = await runWorkflow(api, id, workspace, parameters);
  const executionId = (startResponse.workflow_execution as WorkflowExecution | undefined)?.id;

  if (!executionId) {
    throw new Error("Workflow run did not return an execution id to poll");
  }

  // Poll the execution status until it completes, then consume the result.
  const execution = await pollWorkflowExecution(api, id, executionId, workspace, options);

  if (String(execution.run_status ?? "").toUpperCase() === "FAILED") {
    throw new Error("Workflow execution failed");
  }

  return execution;
};

/**
 * The terminal workflow execution together with the output produced by its final (ender) worker.
 */
export type WorkflowResult = {
  /** The terminal workflow execution. */
  execution: WorkflowExecution;
  /** The ender worker execution, or `null` if the execution did not reference one. */
  workerExecution: WorkerExecution | null;
  /** The output data produced by the ender worker (`workerExecution.result`), or `null`. */
  result: Record<string, unknown> | null;
};

/**
 * Starts a workflow, polls it to completion, then fetches the output produced by its final worker.
 *
 * A workflow execution does not carry the output payload itself — it references the final worker via
 * `ender_worker_execution_id`, and that worker execution's `result` field holds the actual data.
 * This helper performs the full flow: start (async) → poll → fetch ender worker → return its `result`.
 *
 * @param api - Axios instance used to make the HTTP request.
 * @param id - The unique identifier of the workflow to run.
 * @param workspace - The workspace in which the workflow will be executed.
 * @param parameters - Key-value parameters to pass to the workflow.
 * @param options - Polling configuration (interval, timeout, abort signal).
 * @returns A promise that resolves with the {@link WorkflowResult} (execution, ender worker execution, and its result).
 * @throws {Error} If `workspace` is not provided.
 * @throws {Error} If the workflow execution ends in a "FAILED" run status.
 * @throws {Error} If polling times out or is aborted.
 */
export const runWorkflowAndGetResult = async (
  api: AxiosInstance,
  id: string,
  workspace: string,
  parameters: DefaultObject,
  options: PollWorkflowExecutionOptions = {}
): Promise<WorkflowResult> => {
  const execution = await runWorkflowAndPoll(api, id, workspace, parameters, options);

  const enderWorkerExecutionId = execution.ender_worker_execution_id;
  if (!enderWorkerExecutionId) {
    return { execution, workerExecution: null, result: null };
  }

  const workerExecution = await getWorkerExecution(api, id, enderWorkerExecutionId, workspace);

  return { execution, workerExecution, result: workerExecution.result ?? null };
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
    const params: DefaultObject = { workspace, worker_execution_id: workerExecutionId, with_result: true };
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