import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { File } from "../../types/file";
import type { FilterExpression } from "../../types/entityQuery";
import type { DefaultObject } from "../../types/defaultObject";

const baseUrl = "files";

export const getFile = async ( api: AxiosInstance, id: string, workspace: string): Promise<File> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<DefaultObject> = await api.get(`${baseUrl}/${id}`, { params });
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

export const getFiles = async (api: AxiosInstance, query: DefaultObject): Promise<File[]> => {
  const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
  const workspace = workspaceFilter?.[workspaceFilter.length - 1];

  const params: DefaultObject = {
    workspace,
    ...(query ? { query: JSON.stringify(query) } : {}),
  };

  const url = baseUrl;

  try {
    const response: AxiosResponse<DefaultObject> = await api.get(url, { params });
    return response.data?.files ?? [];
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

export const postFile = async (api: AxiosInstance, data: Partial<File>): Promise<File> => {
  try {
    const response: AxiosResponse<File> = await api.post(baseUrl, data);
    return response.data;
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

export const updateFile = async (api: AxiosInstance, id: string, data: Partial<File>): Promise<File> => {
    try {
        const response: AxiosResponse<File> = await api.put(`${baseUrl}/${id}`, data);
        return response.data;
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

export const deleteFile = async (api: AxiosInstance, id: string, workspace: string): Promise<File> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<DefaultObject> = await api.delete(`${baseUrl}/${id}`, { params });
    return response.data.file;
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