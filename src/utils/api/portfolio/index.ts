import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import type { QueryObject } from "../../../types/entityQuery";
import type { DefaultObject } from "../../../types/defaultObject";
import type { FilterExpression } from "../../../types/entityQuery";
import type { Portfolio, PortfolioListResponse, PortfolioSingleResponse } from "../../../types/portfolio";

const baseUrl = "portfolios";

/**
 * getPortfolio
 *
 * Fetches a single portfolio by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - Portfolio identifier.
 * @param {string} workspace - Workspace the portfolio belongs to.
 * @returns {Promise<PortfolioSingleResponse>} The fetched portfolio response.
 *
 * @throws {Error} If the request fails.
 */
export const getPortfolio = async (api: AxiosInstance, id: string, workspace: string): Promise<PortfolioSingleResponse> => {
  
  if(!workspace){
    throw new Error("Workspace is required to fetch a portfolio");
  }
  
  try {
    const params: DefaultObject = { workspace };
    const response: AxiosResponse<PortfolioSingleResponse> = await api.get(`${baseUrl}/${id}`, { params });
    return response.data;
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

/**
 * getPortfolios
 *
 * Fetches a list of portfolios using a query object (filters, order, pagination, etc.).
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {QueryObject} query - Query object built via `buildQueryObject`.
 * @returns {Promise<PortfolioListResponse>} List of portfolios.
 *
 * @throws {Error} If the request fails.
 */
export const getPortfolios = async (api: AxiosInstance, query: QueryObject): Promise<PortfolioListResponse> => {
    const workspaceFilter = query.filters.find((filter: FilterExpression) => filter[0] === "workspace");
    const workspace = workspaceFilter?.[workspaceFilter.length - 1];

    if (!workspace) {
      throw new Error("Workspace is required to fetch portfolios");
    }

    const params: DefaultObject = {
      workspace,
      ...(query ? { query: JSON.stringify(query) } : {}),
    };

    try {
      const response: AxiosResponse<PortfolioListResponse> = await api.get(baseUrl, { params });
      return response.data;
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

/**
 * postPortfolio
 *
 * Creates a new portfolio.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {Partial<Portfolio>} data - Portfolio payload.
 * @returns {Promise<Portfolio>} The created portfolio.
 *
 * @throws {Error} If the request fails.
 */
export const postPortfolio = async (api: AxiosInstance, data: Partial<Portfolio>): Promise<Portfolio> => {

  const { workspace } = data;

   if (!workspace) {
    throw new Error("Workspace is required to post a portfolio");
  }

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

/**
 * updatePortfolio
 *
 * Updates an existing portfolio by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - Portfolio identifier.
 * @param {Partial<Portfolio>} data - Fields to update.
 * @returns {Promise<Portfolio>} The updated portfolio.
 *
 * @throws {Error} If the request fails.
 */
export const updatePortfolio = async (api: AxiosInstance, id: string, data: Partial<Portfolio>): Promise<Portfolio> => {

  const { workspace } = data;
  
  if(!workspace) {
    throw new Error("Workspace is required to delete a portfolio");
  }

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

/**
 * deletePortfolio
 *
 * Deletes a portfolio by ID.
 *
 * @param {AxiosInstance} api - Axios instance.
 * @param {string} id - Portfolio identifier.
 * @param {string} workspace - Workspace the portfolio belongs to.
 * @returns {Promise<Portfolio>} The deleted portfolio.
 *
 * @throws {Error} If the request fails.
 */
export const deletePortfolio = async (api: AxiosInstance, id: string, workspace: string): Promise<Portfolio> => {
  
  if(!workspace) {
    throw new Error("Workspace is required to delete a portfolio");
  }
  
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