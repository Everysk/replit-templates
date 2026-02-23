export interface Workspace {
    name: string;
    group: string | null;
    description: string;
    version: string;
    created: number;
    updated: number;
    [key: string]: unknown;
}

export interface Workflow {
    id: string;
    name: string;
    workspace: string;
    description: string;
    tags: string[];
    created: string;
    updated: string;
    level: string;
    link_uid: string;
    version: string;
    [key: string]: unknown;
}

export interface WorkflowExecution {
    id: string;
    workflow_id: string;
    workflow_name: string;
    workspace: string;
    run_status: WorkflowExecutionStatus;
    started: string;
    finished: string;
    parameters: Record<string, unknown>;
    error: string;
    created: string;
    updated: string;
    [key: string]: unknown;
}

export type WorkflowExecutionStatus =
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "PENDING"
    | "CANCELLED"
    | string;
