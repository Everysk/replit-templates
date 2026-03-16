import type { DeleteEntityResponse, EntityListResponse, EntitySingleResponse } from "./entityQuery";

export interface Workflow {
    id: string;
    name: string;
    workspace: string;
    description: string;
    tags: string[];
    status: string;
    created: number;
    updated: number;
    version: string;
    trigger_enabled: boolean;
    trigger_type: string;
    trigger_config: Record<string, unknown>;
    starter_worker_id: string;
    ender_worker_id: string;
    [key: string]: unknown;
}

export interface WorkflowExecution {
    id: string;
    workflow_id: string;
    workflow_name: string;
    workspace: string;
    status: string;
    run_status: string;
    duration: number;
    real_execution_time: number;
    total_execution_time: number;
    started: number;
    created: number;
    updated: number;
    trigger: string;
    started_worker_id: string;
    ender_worker_id: string;
    ender_worker_execution_id: string;
    resume: unknown;
    version: string;
    [key: string]: unknown;
}

export type WorkerExecution = {
    id: string;
    status: string;
    worker_id: string;
    worker_name: string;
    worker_type: string;
    workflow_execution_id: string;
    workflow_id: string;
    workflow_name: string;
    trigger: string;
    created: number;
    updated: number;
    started: number;
    duration: number;
    cpu_time: number;
    result: Record<string, unknown>;
    input_params: Record<string, unknown>;
    version: string;
};


export type WorkflowSingleResponse = EntitySingleResponse<"workflow", Workflow>;

export type WorkflowListResponse = EntityListResponse<"workflows", Workflow>;

export type DeleteWorkflowResponse = DeleteEntityResponse<"workflows">;

export type WorkflowExecutionSingleResponse = EntitySingleResponse<"workflow_execution", WorkflowExecution>;

export type WorkflowExecutionListResponse = EntityListResponse<"workflow_executions", WorkflowExecution>;

export type WorkerExecutionSingleResponse = EntitySingleResponse<"worker_execution", WorkerExecution>;

export type WorkerExecutionListResponse = {parallel_index_max:number} & EntityListResponse<"worker_executions", WorkerExecution>;
