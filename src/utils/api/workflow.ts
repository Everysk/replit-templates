import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { DefaultObject } from "../../types/defaultObject";

const baseUrl = "workflows";

export const runWorkflow = async (api: AxiosInstance, id: string, workspace: string, parameters: DefaultObject): Promise<DefaultObject> => {
    try {
    const body: DefaultObject = {
      workspace,
      parameters,
    };

    const response: AxiosResponse<DefaultObject> = await api.post(`${baseUrl}/${id}/run`, body);

    if (response.data.workflow_execution?.run_status === "FAILED") {
      throw new Error("Error while running workflow");
    }

    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while running workflow");
  }
};

export const runWorkflowSync = async (api: AxiosInstance, id: string, workspace: string, parameters: DefaultObject): Promise<DefaultObject> => {
    try {
    const body: DefaultObject = {
      workspace,
      synchronous: true,
      parameters,
    };

    const response: AxiosResponse<DefaultObject> = await api.post(`${baseUrl}/${id}/run`, body);

    if (response.data.workflow_execution?.run_status === "FAILED") {
      throw new Error("Error while running workflow");
    }

    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while running workflow");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while running workflow");
  }
};