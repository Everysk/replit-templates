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
    run_status: WorkflowExecutionStatus;
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

export type WorkflowExecutionStatus =
    | "RUNNING"
    | "SUCCEEDED"
    | "FAILED"
    | "PENDING"
    | "CANCELLED"
    | string;


export type WorkflowSingleResponse = EntitySingleResponse<"workflow", Workflow>;

export type WorkflowListResponse = EntityListResponse<"workflows", Workflow>;

export type DeleteWorkflowResponse = DeleteEntityResponse<"workflows">;

export type WorkflowExecutionSingleResponse = EntitySingleResponse<"workflow_execution", WorkflowExecution>;

export type WorkflowExecutionListResponse = EntityListResponse<"workflow_executions", WorkflowExecution>;