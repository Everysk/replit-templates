import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAxios from "./../useAxios";
import useAppAlert from "./../useAppAlert";
import type { Datastore } from "@src/types/datastore";
import { deleteDatastore, postDatastore, updateDatastore } from "@src/utils/api/datastore";

type CreateDatastoreProps = {
    data: Partial<Datastore>;
};

type UpdateDatastoreProps = {
    id: string;
    data: Partial<Datastore>;
};

type DeleteDatastoreProps = {
    id: string;
    workspace: string;
};

type UseDatastoreMutationsProps = {
    queryKey?: unknown[];
};

const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

/**
 * useDatastoreMutations
 *
 * Mutation hook built on TanStack Query to perform Datastore write operations:
 * - create a datastore (POST)
 * - update a datastore (PUT)
 * - delete a datastore (DELETE)
 *
 * It also:
 * - optionally invalidates a target query cache key after successful mutations
 * - displays success/error alerts via `useAppAlert`
 *
 * Important notes:
 * - This hook is intended for side-effect operations only. Reading/retrieving data should be done via `useQuery` or `useFetchDatastore`.
 * - Cache invalidation is controlled by `queryKey`. If `queryKey` is not provided, the hook will still run
 *   mutations and show alerts, but it will NOT invalidate any cached queries.
 * - `remove` requires a `workspace` parameter because the underlying API helper `deleteDatastore(api, id, workspace)`
 *   expects it as a query param.
 *
 * Parameters (UseDatastoreMutationsProps):
 * @param {unknown[]} [queryKey]
 *  Query key to invalidate after successful mutations. Use the same `queryKey` you pass to the relevant `useQuery`
 *  (e.g., datastore list/detail) so UI data is refreshed automatically after a write.
 *
 *  Tip:
 *  - If you're using `useFetchDatastore`, you can pass its returned `queryKey` directly:
 *    `const fetch = useFetchDatastore(...);`
 *    `useDatastoreMutations({ queryKey: fetch.queryKey });`
 *
 * Mutations:
 * - `create`:
 *   - mutationFn: `postDatastore(api, data)`
 *   - variables: `{ data: Partial<Datastore> }`
 *   - success message: "Datastore created successfully."
 *   - error message: "Unable to create the datastore. Please try again." (fallback)
 *
 * - `update`:
 *   - mutationFn: `updateDatastore(api, id, data)`
 *   - variables: `{ id: string; data: Partial<Datastore> }`
 *   - success message: "Datastore updated successfully."
 *   - error message: "Unable to update the datastore. Please try again." (fallback)
 *
 * - `remove`:
 *   - mutationFn: `deleteDatastore(api, id, workspace)`
 *   - variables: `{ id: string; workspace: string }`
 *   - success message: "Datastore deleted successfully."
 *   - error message: "Unable to delete the datastore. Please try again." (fallback)
 *
 * Return value:
 * @returns {object}
 *  Returns an object with the three TanStack Query mutation results:
 *  - `create`: UseMutationResult<Datastore, Error, CreateDatastoreProps, unknown>
 *  - `update`: UseMutationResult<Datastore, Error, UpdateDatastoreProps, unknown>
 *  - `remove`: UseMutationResult<Datastore, Error, DeleteDatastoreProps, unknown>
 *
 * Each mutation includes standard TanStack Query helpers:
 * - `mutate(variables, options?)`
 * - `mutateAsync(variables, options?)`
 * - `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.
 *
 * Examples:
 *
 * 1) Invalidate a datastore list query after mutations:
 * ```ts
 * const { create, update, remove } = useDatastoreMutations({ queryKey: ["datastore"] });
 *
 * // Create
 * create.mutate({
 *   data: {
 *     name: "My datastore",
 *     workspace: "ws-1",
 *     data: [["id", "name"], ["ABEOX135", "Jorge"]],
 *   }
 * });
 *
 * // Update
 * update.mutate({
 *   id: "ds-123",
 *   data: {
 *     name: "Renamed datastore",
 *     data: [["id", "name"], ["ABEOX135", "Jorge"]],
 *   }
 * });
 *
 * // Delete
 * remove.mutate({
 *   id: "ds-123",
 *   workspace: "ws-1"
 * });
 * ```
 *
 * 2) Using async/await with `mutateAsync`:
 * ```ts
 * const { create } = useDatastoreMutations({ queryKey: ["datastore"] });
 *
 * await create.mutateAsync({
 *   data: {
 *     name: "My datastore",
 *     workspace: "ws-1",
 *     data: [["id", "name"], ["ABEOX135", "Jorge"]],
 *   }
 * });
 * ```
 *
 * 3) Without cache invalidation (no queryKey):
 * ```ts
 * const { update } = useDatastoreMutations({});
 *
 * update.mutate({
 *   id: "ds-123",
 *   data: { name: "Renamed datastore" }
 * });
 * // Mutation still runs and alerts are shown, but cached queries are not invalidated.
 * ```
 *
 * 4) Using `useFetchDatastore` queryKey for automatic invalidation:
 * ```ts
 * const fetch = useFetchDatastore({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 *
 * const { create } = useDatastoreMutations({ queryKey: fetch.queryKey });
 *
 * await create.mutateAsync({
 *   data: { name: "My datastore", workspace: "ws-1" }
 * });
 * ```
 */

const useDatastoreMutations = ({ queryKey }: UseDatastoreMutationsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();
    const queryClient = useQueryClient();

    const invalidate = async () => {
        if (!queryKey?.length) return;
        await queryClient.invalidateQueries({ queryKey });
    };

    const create = useMutation({
        mutationFn: async ({ data }: CreateDatastoreProps) => postDatastore(api, data),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "Datastore created successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(err, "Unable to create the datastore. Please try again."),
            });
        },
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: UpdateDatastoreProps) => updateDatastore(api, id, data),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "Datastore updated successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(err, "Unable to update the datastore. Please try again."),
            });
        },
    });

    const remove = useMutation({
        mutationFn: async ({ id, workspace }: DeleteDatastoreProps) => deleteDatastore(api, id, workspace),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "Datastore deleted successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(err, "Unable to delete the datastore. Please try again."),
            });
        },
    });

    return { create, update, remove };
};

export default useDatastoreMutations;
