import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAxios from "../useAxios";
import useAppAlert from "../useAppAlert";
import type { File } from "../../types/file";
import { deleteFile, postFile, updateFile } from "../../utils/api/file";

type CreateFileProps = {
    data: Partial<File>;
};

type UpdateFileProps = {
    id: string;
    data: Partial<File>;
};

type DeleteFileProps = {
    id: string;
    workspace: string;
};

type UseFileMutationsProps = {
    queryKey?: unknown[];
};

const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

/**
 * useFileMutations
 *
 * Mutation hook built on TanStack Query to perform File write operations:
 * - create a file (POST)
 * - update a file (PUT)
 * - delete a file (DELETE)
 *
 * It also:
 * - optionally invalidates a target query cache key after successful mutations
 * - displays success/error alerts via `useAppAlert`
 *
 * Important notes:
 * - This hook is intended for side-effect operations only. Reading/retrieving data should be done via `useQuery` or `useFetchFile`.
 * - Cache invalidation is controlled by `queryKey`. If `queryKey` is not provided, the hook will still run
 *   mutations and show alerts, but it will NOT invalidate any cached queries.
 * - `remove` requires a `workspace` parameter because the underlying API helper `deleteFile(api, id, workspace)`
 *   expects it as a query param.
 * 
 * - File content (`data`):
 *   - When creating/updating a file, the file content must be provided in `data` as a Base64-encoded string.
 *   - Send only the raw Base64 content (do not include a data URL prefix like `data:<mime>;base64,`)
 *   - `content_type` should match the file MIME type (e.g., "text/csv", "application/pdf").
 *
 * Parameters (UseFileMutationsProps):
 * @param {unknown[]} [queryKey]
 *  Query key to invalidate after successful mutations. Use the same `queryKey` you pass to the relevant `useQuery`
 *  (e.g., file list/detail) so UI data is refreshed automatically after a write.
 *
 *  Tip:
 *  - If you're using `useFetchFile`, you can pass its returned `queryKey` directly:
 *    `const fetch = useFetchFile(...);`
 *    `useFileMutations({ queryKey: fetch.queryKey });`
 *
 * Mutations:
 * - `create`:
 *   - mutationFn: `postFile(api, data)`
 *   - variables: `{ data: Partial<File> }`
 *   - success message: "File created successfully."
 *   - error message: "Unable to create the file. Please try again." (fallback)
 *
 * - `update`:
 *   - mutationFn: `updateFile(api, id, data)`
 *   - variables: `{ id: string; data: Partial<File> }`
 *   - success message: "File updated successfully."
 *   - error message: "Unable to update the file. Please try again." (fallback)
 *
 * - `remove`:
 *   - mutationFn: `deleteFile(api, id, workspace)`
 *   - variables: `{ id: string; workspace: string }`
 *   - success message: "File deleted successfully."
 *   - error message: "Unable to delete the file. Please try again." (fallback)
 *
 * Return value:
 * @returns {object}
 *  Returns an object with the three TanStack Query mutation results:
 *  - `create`: UseMutationResult<File, Error, CreateFileProps, unknown>
 *  - `update`: UseMutationResult<File, Error, UpdateFileProps, unknown>
 *  - `remove`: UseMutationResult<File, Error, DeleteFileProps, unknown>
 *
 * Each mutation includes standard TanStack Query helpers:
 * - `mutate(variables, options?)`
 * - `mutateAsync(variables, options?)`
 * - `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.
 *
 * Examples:
 *
 * 1) Invalidate a file list query after mutations:
 * ```ts
 * const { create, update, remove } = useFileMutations({ queryKey: ["file"] });
 *
 * // Create
 * create.mutate({
 *   data: {
 *     name: "My file",
 *     workspace: "ws-1",
 *     content_type: "text/plain",
 *     version: "1",
 *     link_uid: null,
 *     data: "SGVsbG8gd29ybGQ=", // Base64 content
 *   }
 * });
 *
 * // Update
 * update.mutate({
 *   id: "file-123",
 *   data: {
 *     name: "Renamed file",
 *     content_type: "text/plain",
 *     data: "SGVsbG8gd29ybGQ=", // Base64 content (optional if only renaming)
 *   }
 * });
 *
 * // Delete
 * remove.mutate({ id: "file-123", workspace: "ws-1" });
 * ```
 *
 * 2) Using async/await with `mutateAsync`:
 * ```ts
 * const { create } = useFileMutations({ queryKey: ["file"] });
 *
 * await create.mutateAsync({
 *   data: {
 *     name: "My file",
 *     workspace: "ws-1",
 *     content_type: "text/plain",
 *     version: "1",
 *     link_uid: null,
 *     data: "SGVsbG8gd29ybGQ=",
 *   }
 * });
 * ```
 *
 * 3) Without cache invalidation (no queryKey):
 * ```ts
 * const { update } = useFileMutations({});
 *
 * update.mutate({
 *   id: "file-123",
 *   data: {
 *     name: "New name",
 *     content_type: "text/plain",
 *   }
 * });
 * // Mutation still runs and alerts are shown, but cached queries are not invalidated.
 * ```
 *
 * 4) Using `useFetchFile` queryKey for automatic invalidation:
 * ```ts
 * const fetch = useFetchFile({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 *
 * const { remove } = useFileMutations({ queryKey: fetch.queryKey });
 *
 * await remove.mutateAsync({ id: "file-123", workspace: "ws-1" });
 * ```
 */

const useFileMutations = ({ queryKey }: UseFileMutationsProps) => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();
    const queryClient = useQueryClient();

    const invalidate = async () => {
        if (!queryKey?.length) return;
        await queryClient.invalidateQueries({ queryKey });
    };

    const create = useMutation({
        mutationFn: async ({ data }: CreateFileProps) => postFile(api, data),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "File created successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(
                    err,
                    "Unable to create the file. Please try again."
                ),
            });
        },
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: UpdateFileProps) => updateFile(api, id, data),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "File updated successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(
                    err,
                    "Unable to update the file. Please try again."
                ),
            });
        },
    });

    const remove = useMutation({
        mutationFn: async ({ id, workspace }: DeleteFileProps) => deleteFile(api, id, workspace),
        onSuccess: async () => {
            await invalidate();
            showAlert({
                severity: "success",
                message: "File deleted successfully.",
            });
        },
        onError: (err: unknown) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(
                    err,
                    "Unable to delete the file. Please try again."
                ),
            });
        },
    });

    return { create, update, remove };
};

export default useFileMutations;
