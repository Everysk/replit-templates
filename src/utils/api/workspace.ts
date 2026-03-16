import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "../../types/defaultObject";
import type { FilterExpression, QueryObject } from "../../types/entityQuery";
import type { Workspace, WorkspaceListResponse, WorkspaceSingleResponse } from "../../types/workspace";

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
 * Fetches a list of workspaces using a query object (filters, order, pagination, etc.).
 *
 * Note: `workspace` is extracted from the query filters and sent as a separate
 * query param alongside the serialized query object.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {QueryObject} query - Query object built via `buildQueryObject`.
 * @returns {Promise<WorkspaceListResponse>} List of workspaces.
 *
 * @throws {Error} If the request fails.
 */
export const getWorkspaces = async (api: AxiosInstance, query: QueryObject): Promise<WorkspaceListResponse> => {
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];

  if (!workspace) throw new Error("Workspace filter is required to list workspaces");

  const params: DefaultObject = {
    workspace,
    ...(query ? { query: JSON.stringify(query) } : {}),
  };

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
