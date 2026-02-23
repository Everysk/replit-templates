import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import type { Portfolio } from "../types/portfolio";
import { buildApiQueryParams } from "../utils/apiQuery";
import { getPortfolio, getPortfolios } from "../utils/api/portfolio";
import type { EntityQueryOptions, FetchEntityParams } from "../types/entityQuery";

export type FetchPortfolioProps<TData = Portfolio, TSelected = TData> = FetchEntityParams<TData, TSelected>;

const defaultQueryOptions: EntityQueryOptions<Portfolio[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}

/**
 * useFetchPortfolio
 *
 * Data-fetching hook built on TanStack Query to retrieve:
 * - a single portfolio (when `id` is provided), or
 * - a list of portfolios (when `id` is null)
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * Important notes:
 * - The query always returns `Portfolio[]`:
 *   - If `id` is provided: returns `[Portfolio]` (single-item array)
 *   - If `id` is null: returns `Portfolio[]` (list)
 *
 * - When `id` is provided, a `workspace` filter is expected because `getPortfolio`
 *   requires a `workspace` value.
 *
 * Parameters (FetchPortfolioProps):
 * @param {string | null} id
 *  Portfolio identifier. If provided, fetches only that portfolio.
 *  If null, fetches the portfolio list using filters/ordering.
 *
 * @param {FilterClause[]} [filters=[]]
 *  Filters applied to the request.
 *  When `id` is provided, a `workspace` filter is expected because `getPortfolio`
 *  requires a `workspace` value.
 *
 * @param {string[]} [order=[]]
 *  Sorting applied to list requests (when `id` is null).
 *
 * @param {string} [projection=""]
 *  Projection/fields requested from the API (if supported). If empty, projection is omitted.
 *
 * @param {EntityQueryOptions<any>} [queryOptions=defaultQueryOptions]
 *  TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *  Note: must be compatible with the actual query function return type.
 *
 * Returns:
 * @returns {object}
 *  Returns TanStack Query's `query` object extended with:
 *  - `queryKey`: the cache key used by React Query
 *
 * Tip:
 * - The returned `queryKey` can be reused by mutation hooks for cache invalidation:
 *   `const fetch = useFetchPortfolio(...);`
 *   `usePortfolioMutations({ queryKey: fetch.queryKey });`
 *
 * Examples:
 *
 * 1) Fetch a single portfolio:
 * ```ts
 * const { data, isLoading } = useFetchPortfolio({
 *   id: "pf-123",
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 * // data -> Portfolio[] (single-item array)
 * ```
 *
 * 2) Fetch a list of portfolios:
 * ```ts
 * const { data } = useFetchPortfolio({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   order: ["created desc"],
 * });
 * // data -> Portfolio[]
 * ```
 *
 * 3) Reuse queryKey for invalidation in mutations:
 * ```ts
 * const fetch = useFetchPortfolio({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 *
 * const { update } = usePortfolioMutations({ queryKey: fetch.queryKey });
 *
 * update.mutate({
 *   id: "pf-123",
 *   data: { name: "Renamed Portfolio" },
 * });
 * ```
 */

const useFetchPortfolio = ({ id = null, filters = [], order = [], projection = "", queryOptions = defaultQueryOptions }: FetchPortfolioProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();


    const queryFilter = buildApiQueryParams({ filters, order, projection });

    const queryKey = [
        "portfolio",
        id,
        ...filters.flatMap((filter) => filter.value)
    ];

    const query = useQuery<Portfolio[]>({
        queryKey,
        queryFn: async () => {

            if (id) {

                const portfolio = await getPortfolio(
                    api,
                    id,
                    filters.find(filter => filter.field === "workspace")?.value as string
                );

                return [portfolio];

            }

            const portfolios = await getPortfolios(api, queryFilter);

            return portfolios;
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