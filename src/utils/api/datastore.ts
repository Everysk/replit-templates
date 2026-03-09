import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { Datastore } from "../../types/datastore";
import type { DefaultObject } from "../../types/defaultObject";

const baseUrl = "datastores";

export const getDatastore = async ( api: AxiosInstance, id: string, workspace: string): Promise<Datastore> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<DefaultObject> = await api.get(`${baseUrl}/${id}`, { params });
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

export const getDatastores = async (api: AxiosInstance, query: DefaultObject): Promise<Datastore[]> => {

  const params: DefaultObject = {
    page_size: 20,
    ...(query ? { query: JSON.stringify(query) } : {}),
  };

  const url = baseUrl;

  try {
    const response: AxiosResponse<DefaultObject> = await api.get(url, { params });
    return response.data?.datastores ?? [];
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

export const postDatastore = async (api: AxiosInstance, data: Partial<Datastore>): Promise<Datastore> => {
  try {
    const response: AxiosResponse<Datastore> = await api.post(baseUrl, data);
    return response.data;
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

export const updateDatastore = async (api: AxiosInstance, id: string, data: Partial<Datastore>): Promise<Datastore> => {
  try {
    const response: AxiosResponse<Datastore> = await api.put(`${baseUrl}/${id}`, data);
    return response.data;
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

export const deleteDatastore = async (api: AxiosInstance, id: string, workspace: string): Promise<Datastore> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<Datastore> = await api.delete(`${baseUrl}/${id}`, { params });
    return response.data;
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
