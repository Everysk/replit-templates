import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import useAxios from "../useAxios";
import useAppAlert from "../useAppAlert";
import type { Portfolio } from "../../types/portfolio";
import { getPortfolio } from "../../utils/api/portfolio";
import type { EntityQueryOptions, FetchEntityParams } from "../../types/entityQuery";

export type FetchPortfolioProps<TData = Portfolio, TSelected = TData> = FetchEntityParams<TData, TSelected>;

const defaultQueryOptions: EntityQueryOptions<Portfolio> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}

/**
 * useFetchPortfolio
 *
 * Data-fetching hook built on TanStack Query to retrieve a single portfolio by ID.
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * Important notes:
 * - Always returns a single `Portfolio` object.
 *
 * Parameters (FetchPortfolioProps):
 * @param {string} id
 *   Portfolio identifier (required).
 *
 * @param {string} workspace
 *   Workspace the portfolio belongs to (required by `getPortfolio`).
 *
 * @param {EntityQueryOptions<Portfolio>} [queryOptions=defaultQueryOptions]
 *   TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *
 * Returns:
 * @returns {object}
 *   TanStack Query's `query` object extended with:
 *   - `queryKey`: the cache key used by React Query
 *
 * Tip:
 * - The returned `queryKey` can be reused by mutation hooks for cache invalidation:
 *   ```ts
 *   const fetch = useFetchPortfolio({ id: "pf-123", workspace: "ws-1" });
 *   usePortfolioMutations({ queryKey: fetch.queryKey });
 *   ```
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchPortfolio({
 *   id: "pf-123",
 *   workspace: "ws-1",
 * });
 * // data -> Portfolio
 * ```
 */
const useFetchPortfolio = ({ id, workspace, queryOptions = defaultQueryOptions }: FetchPortfolioProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = [
        "portfolio",
        id,
        workspace
    ];

    const query = useQuery<Portfolio>({
        queryKey,
        queryFn: async () => {
            const response = await getPortfolio(api, id, workspace);
            return response.portfolio;
        },
        ...queryOptions ?? {}
    });

    useEffect(() => {
        if (!query.error) return;

        showAlert({
            severity: "error",
            message: query.error.message,
        });
    }, [query.error, showAlert]);

    return {
        ...query,
        queryKey,
    };
};

export default useFetchPortfolio;