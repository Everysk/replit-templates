import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "@src/types/defaultObject";
import type { DeleteEntityDefaultResponse, FilterExpression, QueryObject } from "@src/types/entityQuery";
import type { Datastore, DatastoreSingleResponse, DatastoreListResponse, DeleteDatastoreResponse } from "@src/types/datastore";

const baseUrl = "datastores";

/**
 * getDatastore
 *
 * Fetches a single datastore by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - Datastore identifier.
 * @param {string} workspace - Workspace the datastore belongs to.
 * @returns {Promise<Datastore>} The fetched datastore.
 *
 * @throws {Error} If the request fails.
 */
export const getDatastore = async (api: AxiosInstance, id: string, workspace: string): Promise<Datastore> => {
  const params: DefaultObject = { workspace };

  if (!workspace) throw new Error("Workspace filter is required to fetch a datastore");

  try {
    const response: AxiosResponse<DatastoreSingleResponse> = await api.get(`${baseUrl}/${id}`, { params });
    return response.data.datastore;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error fetching datastore");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error fetching datastore");
  }
};

/**
 * getDatastores
 *
 * Fetches a list of datastores using a query object (filters, order, pagination, etc.).
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {DefaultObject} query - Query object built via `buildQueryObject`.
 * @returns {Promise<DatastoreListResponse>} Paginated list of datastores.
 *
 * @throws {Error} If workspace filter is missing.
 * @throws {Error} If the request fails.
 */
export const getDatastores = async (api: AxiosInstance, query: QueryObject): Promise<DatastoreListResponse> => {
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];

  if (!workspace) throw new Error("Workspace filter is required to list datastores");

  const params: DefaultObject = {
    workspace,
    ...(query ? { query: JSON.stringify(query) } : {}),
  };

  try {
    const response: AxiosResponse<DatastoreListResponse> = await api.get(baseUrl, { params });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error listing datastores");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error listing datastores");
  }
};

/**
 * postDatastore
 *
 * Creates a new datastore.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {Partial<Datastore>} data - Datastore payload.
 * @returns {Promise<Datastore>} The created datastore.
 *
 * @throws {Error} If the request fails.
 */
export const postDatastore = async (api: AxiosInstance, data: Partial<Datastore>): Promise<Datastore> => {

  const { workspace } = data;
  if (!workspace) throw new Error("Workspace filter is required to create a datastore");

  try {
    const response: AxiosResponse<DatastoreSingleResponse> = await api.post(baseUrl, data);
    return response.data.datastore;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error creating datastore");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error creating datastore");
  }
};

/**
 * updateDatastore
 *
 * Updates an existing datastore by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - Datastore identifier.
 * @param {Partial<Datastore>} data - Fields to update.
 * @returns {Promise<Datastore>} The updated datastore.
 *
 * @throws {Error} If the request fails.
 */
export const updateDatastore = async (api: AxiosInstance, id: string, data: Partial<Datastore>): Promise<Datastore> => {

  const { workspace } = data;
  if (!workspace) throw new Error("Workspace filter is required to update a datastore");

  try {
    const response: AxiosResponse<DatastoreSingleResponse> = await api.put(`${baseUrl}/${id}`, data);
    return response.data.datastore;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error updating datastore");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error updating datastore");
  }
};

/**
 * deleteDatastore
 *
 * Deletes a datastore by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - Datastore identifier.
 * @param {string} workspace - Workspace the datastore belongs to.
 * @returns {Promise<DeleteEntityDefaultResponse[]>} List of deleted entity records.
 *
 * @throws {Error} If the request fails.
 */
export const deleteDatastore = async (api: AxiosInstance, id: string, workspace: string): Promise<DeleteEntityDefaultResponse[]> => {
  if (!workspace) throw new Error("Workspace filter is required to delete a datastore");

  try {
    const params: DefaultObject = { workspace };
    const response: AxiosResponse<DeleteDatastoreResponse> = await api.delete(`${baseUrl}/${id}`, { params });
    return response.data.datastores;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error removing datastore");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error removing datastore");
  }
};