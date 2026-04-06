import type { EntityListResponse, EntitySingleResponse } from "./entityQuery";

export interface Workspace {
    name: string;
    group: string | null;
    description: string;
    version: string;
    created: number;
    updated: number;
    [key: string]: unknown;
}

export type WorkspaceSingleResponse = EntitySingleResponse<"workspace", Workspace>;

export type WorkspaceListResponse = EntityListResponse<"workspaces", Workspace>;