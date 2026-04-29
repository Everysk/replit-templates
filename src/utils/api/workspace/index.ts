import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "@src/types/defaultObject";
import type { Workspace, WorkspaceListResponse, WorkspaceSingleResponse } from "@src/types/workspace";

const baseUrl = "workspaces";

/**
 * getWorkspace
 *
 * Fetches a single workspace by name.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} name - Workspace name.
 * @returns {Promise<Workspace>} The fetched workspace.
 *
 * @throws {Error} If the request fails.
 */
export const getWorkspace = async (api: AxiosInstance, name: string): Promise<Workspace> => {
  if (!name) throw new Error("Workspace name is required to fetch a workspace");

  try {
    const response: AxiosResponse<WorkspaceSingleResponse> = await api.get(`${baseUrl}/${name}`);
    return response.data.workspace;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while fetching workspace");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while fetching workspace");
  }
};

/**
 * getWorkspaces
 *
 * Fetches a list of workspaces with optional cursor-based pagination.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} [workspace] - Current workspace name. Sent as a query param via the legacy method, required by some API configurations.
 * @param {number} [pageSize] - Number of items per page.
 * @param {string} [pageToken] - Cursor token for the next page.
 * @returns {Promise<WorkspaceListResponse>} List of workspaces.
 *
 * @throws {Error} If the request fails.
 */
export const getWorkspaces = async (api: AxiosInstance, workspace?: string, pageSize?: number, pageToken?: string): Promise<WorkspaceListResponse> => {
  const params: DefaultObject = {};

  if (workspace) params.workspace = workspace;
  if (pageSize) params.page_size = pageSize;
  if (pageToken) params.page_token = pageToken;

  try {
    const response: AxiosResponse<WorkspaceListResponse> = await api.get(baseUrl, { params });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while fetching workspaces");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while fetching workspaces");
  }
};
