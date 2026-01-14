import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert";
import type { Portfolio } from "../types/portfolio";
import { deletePortfolio, postPortfolio, updatePortfolio } from "../utils/api/portfolio";

type CreatePortfolioProps = {
    data: Partial<Portfolio>;
};

type UpdatePortfolioProps = {
    id: string;
    data: Partial<Portfolio>;
};

type DeletePortfolioProps = {
    id: string;
    workspace: string;
};

type UsePortfolioMutationsProps = {
    queryKey?: unknown[];
};

const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

/**
 * usePortfolioMutations
 *
 * Mutation hook built on TanStack Query to perform Portfolio write operations:
 * - create a portfolio (POST)
 * - update a portfolio (PUT)
 * - delete a portfolio (DELETE)
 *
 * It also:
 * - optionally invalidates a target query cache key after successful mutations
 * - displays success/error alerts via `useAppAlert`
 *
 * Important notes:
 * - This hook is intended for side-effect operations only. Reading/retrieving data should be done via `useQuery` or `useFetchPortfolio`.
 * - Cache invalidation is controlled by `queryKey`. If `queryKey` is not provided, the hook will still run
 *   mutations and show alerts, but it will NOT invalidate any cached queries.
 * - `remove` requires a `workspace` parameter because the underlying API helper `deletePortfolio(api, id, workspace)`
 *   expects it as a query param.
 *
 * Parameters (UsePortfolioMutationsProps):
 * @param {unknown[]} [queryKey]
 *  Query key to invalidate after successful mutations. Use the same `queryKey` you pass to the relevant `useQuery`
 *  (e.g., portfolio list/detail) so UI data is refreshed automatically after a write.
 *
 *  Tip:
 *  - If you're using `useFetchPortfolio`, you can pass its returned `queryKey` directly:
 *    `const fetch = useFetchPortfolio(...);`
 *    `usePortfolioMutations({ queryKey: fetch.queryKey });`
 *
 * Mutations:
 * - `create`:
 *   - mutationFn: `postPortfolio(api, data)`
 *   - variables: `{ data: Partial<Portfolio> }`
 *   - success message: "Portfolio created successfully."
 *   - error message: "We couldn't create the portfolio. Please review your inputs and try again." (fallback)
 *
 * - `update`:
 *   - mutationFn: `updatePortfolio(api, id, data)`
 *   - variables: `{ id: string; data: Partial<Portfolio> }`
 *   - success message: "Portfolio updated successfully."
 *   - error message: "We couldn't update the portfolio. Please try again." (fallback)
 *
 * - `remove`:
 *   - mutationFn: `deletePortfolio(api, id, workspace)`
 *   - variables: `{ id: string; workspace: string }`
 *   - success message: "Portfolio deleted successfully."
 *   - error message: "We couldn't delete the portfolio. Please try again." (fallback)
 *
 * Return value:
 * @returns {object}
 *  Returns an object with the three TanStack Query mutation results:
 *  - `create`: UseMutationResult<Portfolio, Error, CreatePortfolioProps, unknown>
 *  - `update`: UseMutationResult<Portfolio, Error, UpdatePortfolioProps, unknown>
 *  - `remove`: UseMutationResult<Portfolio, Error, DeletePortfolioProps, unknown>
 *
 * Each mutation includes standard TanStack Query helpers:
 * - `mutate(variables, options?)`
 * - `mutateAsync(variables, options?)`
 * - `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.
 *
 * Examples:
 *
 * 1) Invalidate a portfolio list query after mutations:
 * ```ts
 * const { create, update, remove } = usePortfolioMutations({ queryKey: ["portfolio"] });
 *
  * // Create (minimal example - other Security fields omitted for brevity)
 * create.mutate({
 *   data: {
 *     name: "My Portfolio",
 *     description: "Test portfolio",
 *     base_currency: "USD",
 *     date: "2026-01-08",
 *     workspace: "ws-1",
 *     securities: [
 *       {
 *         id: "sec-1",
 *         ticker: "AAPL",
 *         symbol: "AAPL",
 *         name: "Apple Inc.",
 *         currency: "USD",
 *         quantity: 10,
 *         market_price: 200,
 *         market_value: 2000,
 *         market_value_in_base: 2000,
 *         fx_rate: 1,
 *         instrument_type: "Equity",
 *         instrument_class: "Equity",
 *         asset_class: "Equity",
 *         exchange: "NASDAQ",
 *         status: "active",
 *         // Other fields are nullable in the Security type and can be omitted here for documentation purposes.
 *       } as Security,
 *     ],
 *   }
 * });
 *
 * // Update (partial)
 * update.mutate({
 *   id: "pf-123",
 *   data: {
 *     name: "Renamed Portfolio",
 *     tags: ["tag-1", "tag-2"],
 *     check_securities: true,
 *   }
 * });
 *
 * // Delete
 * remove.mutate({ id: "pf-123", workspace: "ws-1" });
 * ```
 *
 * 2) Using async/await with `mutateAsync`:
 * ```ts
 * const { create } = usePortfolioMutations({ queryKey: ["portfolio"] });
 *
 * await create.mutateAsync({
 *   data: {
 *     name: "My Portfolio",
 *     base_currency: "USD",
 *     date: "2026-01-08",
 *     workspace: "ws-1",
 *     securities: [],
 *   }
 * });
 * ```
 *
 * 3) Without cache invalidation (no queryKey):
 * ```ts
 * const { update } = usePortfolioMutations({});
 *
 * update.mutate({
 *   id: "pf-123",
 *   data: { description: "Updated description" }
 * });
 * // Mutation still runs and alerts are shown, but cached queries are not invalidated.
 * ```
 *
 * 4) Using `useFetchPortfolio` queryKey for automatic invalidation:
 * ```ts
 * const fetch = useFetchPortfolio({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 *
 * const { remove } = usePortfolioMutations({ queryKey: fetch.queryKey });
 *
 * await remove.mutateAsync({ id: "pf-123", workspace: "ws-1" });
 * ```
 */

const usePortfolioMutations = ({ queryKey }: UsePortfolioMutationsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();
    const queryClient = useQueryClient();

    const invalidate = async () => {
        if (!queryKey?.length) return;
        await queryClient.invalidateQueries({ queryKey });
    };

    const create = useMutation({
        mutationFn: async ({ data }: CreatePortfolioProps) => postPortfolio(api, data),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "Portfolio created successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(
                    err,
                    "We couldn't create the portfolio. Please review your inputs and try again."
                ),
            });
        },
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: UpdatePortfolioProps) => updatePortfolio(api, id, data),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "Portfolio updated successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(
                    err,
                    "We couldn't update the portfolio. Please try again."
                ),
            });
        },
    });

    const remove = useMutation({
        mutationFn: async ({ id, workspace }: DeletePortfolioProps) => deletePortfolio(api, id, workspace),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "Portfolio deleted successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(
                    err,
                    "We couldn't delete the portfolio. Please try again."
                ),
            });
        },
    });

    return { create, update, remove };
};

export default usePortfolioMutations;
