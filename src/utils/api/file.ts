import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "../../types/defaultObject";
import type { DeleteFileResponse, File, FileListResponse, FileSingleResponse } from "../../types/file";
import type { DeleteEntityDefaultResponse, FilterExpression, QueryObject } from "../../types/entityQuery";

const baseUrl = "files";

/**
 * getFile
 *
 * Fetches a single file by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - File identifier.
 * @param {string} workspace - Workspace the file belongs to.
 * @returns {Promise<File>} The fetched file.
 *
 * @throws {Error} If the request fails.
 */
export const getFile = async (api: AxiosInstance, id: string, workspace: string): Promise<File> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<FileSingleResponse> = await api.get(`${baseUrl}/${id}`, { params });
    return response.data.file;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
     throw new Error(error.message || "Error while fetching file");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while fetching file");
  }
};

/**
 * getFiles
 *
 * Fetches a list of files using a query object (filters, order, pagination, etc.).
 *
 * Note: `workspace` is extracted from the query filters and sent as a separate
 * query param alongside the serialized query object.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {QueryObject} query - Query object built via `buildQueryObject`.
 * @returns {Promise<File[]>} List of files. Returns an empty array if none found.
 *
 * @throws {Error} If the request fails.
 */
export const getFiles = async (api: AxiosInstance, query: QueryObject): Promise<FileListResponse> => {
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];
  
  if (!workspace) throw new Error("Workspace filter is required to list files");

  const params: DefaultObject = {
    workspace,
    ...(query ? { query: JSON.stringify(query) } : {}),
  };

  try {
    const response: AxiosResponse<FileListResponse> = await api.get(baseUrl, { params });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while fetching files");
    } 
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while fetching files");
  }
};

/**
 * postFile
 *
 * Creates a new file.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {Partial<File>} data - File payload.
 * @returns {Promise<File>} The created file.
 *
 * @throws {Error} If the request fails.
 */
export const postFile = async (api: AxiosInstance, data: Partial<File>): Promise<File> => {

  const { workspace } = data;
  if (!workspace) throw new Error("Workspace filter is required to create a file");

  try {
    const response: AxiosResponse<FileSingleResponse> = await api.post(baseUrl, data);
    return response.data.file;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while creating file");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while creating file");
  }
};

/**
 * updateFile
 *
 * Updates an existing file by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - File identifier.
 * @param {Partial<File>} data - Fields to update.
 * @returns {Promise<File>} The updated file.
 *
 * @throws {Error} If the request fails.
 */
export const updateFile = async (api: AxiosInstance, id: string, data: Partial<File>): Promise<File> => {

    const { workspace } = data;
    if (!workspace) throw new Error("Workspace filter is required to update a file");

    try {
        const response: AxiosResponse<FileSingleResponse> = await api.put(`${baseUrl}/${id}`, data);
        return response.data.file;
    } catch (error: unknown) {
        if (isAxiosError<DefaultObject>(error)) {
            throw new Error(error.message || "Error while updating file");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Error while updating file");
    }
};

/**
 * deleteFile
 *
 * Deletes a file by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - File identifier.
 * @param {string} workspace - Workspace the file belongs to.
 * @returns {Promise<DeleteEntityDefaultResponse[]>} List of deleted entity records.
 *
 * @throws {Error} If the request fails.
 */
export const deleteFile = async (api: AxiosInstance, id: string, workspace: string): Promise<DeleteEntityDefaultResponse[]> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<DeleteFileResponse> = await api.delete(`${baseUrl}/${id}`, { params });
    return response.data.files;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while deleting file");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while deleting file");
  }
};