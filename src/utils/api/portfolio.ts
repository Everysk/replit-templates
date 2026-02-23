import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { Portfolio } from "../../types/portfolio";
import type { FilterExpression } from "../../types/entityQuery";
import type { DefaultObject } from "../../types/defaultObject";

const baseUrl = "portfolios";

export const getPortfolio = async ( api: AxiosInstance, id: string, workspace: string): Promise<Portfolio> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<DefaultObject> = await api.get(`${baseUrl}/${id}`, { params });
    return response.data.portfolio;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
     throw new Error(error.message || "Error while fetching portfolio");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while fetching portfolio");
  }
};

export const getPortfolios = async (api: AxiosInstance, query: DefaultObject): Promise<Portfolio[]> => {
    const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
    const workspace = workspaceFilter?.[workspaceFilter.length - 1];

    const params: DefaultObject = {
      workspace,
      ...(query ? { query: JSON.stringify(query) } : {}),
    };

    const url = baseUrl;

    try {
      const response: AxiosResponse<DefaultObject> = await api.get(url, { params });
      return response.data?.portfolios ?? [];
    } catch (error: unknown) {
      if (isAxiosError<DefaultObject>(error)) {
        throw new Error(error.message || "Error while fetching portfolios");
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Error while fetching portfolios");
    }
}

export const postPortfolio = async (api: AxiosInstance, data: Partial<Portfolio>): Promise<Portfolio> => {
  try {
    const response: AxiosResponse<Portfolio> = await api.post(baseUrl, data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while creating portfolio");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while creating portfolio");
  }
}

export const updatePortfolio = async (api: AxiosInstance, id: string, data: Partial<Portfolio>): Promise<Portfolio> => {
  try {
    const response: AxiosResponse<Portfolio> = await api.put(`${baseUrl}/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while updating portfolio");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while updating portfolio");
  }
}

export const deletePortfolio = async (api: AxiosInstance, id: string, workspace: string): Promise<Portfolio> => {
  const params: DefaultObject = { workspace };

  try {
    const response: AxiosResponse<Portfolio> = await api.delete(`${baseUrl}/${id}`, { params });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError<DefaultObject>(error)) {
      throw new Error(error.message || "Error while deleting portfolio");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error while deleting portfolio");
  }
}