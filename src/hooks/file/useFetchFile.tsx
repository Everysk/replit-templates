import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import type { File } from "@src/types/file";
import useAppAlert from "@src/hooks/useAppAlert";
import { getFile } from "@src/utils/api/file";
import type { EntityQueryOptions, FetchEntityParams } from "@src/types/entityQuery";

export type FetchFileProps<TData = File, TSelected = TData> = FetchEntityParams<TData, TSelected>;

const defaultQueryOptions: EntityQueryOptions<File> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}

/**
 * useFetchFile
 *
 * Data-fetching hook built on TanStack Query to retrieve a single file by ID.
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * Important notes:
 * - Always returns a single `File` object.
 * - `File.data` represents the file content and is expected to be a Base64-encoded string
 *   when provided by the API (or when sending content through mutations).
 *
 * Parameters (FetchFileProps):
 * @param {string} id
 *   File identifier (required).
 *
 * @param {string} workspace
 *   Workspace the file belongs to (required by `getFile`).
 *
 * @param {EntityQueryOptions<any>} [queryOptions=defaultQueryOptions]
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
 *   const fetch = useFetchFile({ id: "file-123", workspace: "ws-1" });
 *   useFileMutations({ queryKey: fetch.queryKey });
 *   ```
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchFile({
 *   id: "file-123",
 *   workspace: "ws-1",
 * });
 * // data -> File
 * ```
 */
const useFetchFile = ({ id, workspace, queryOptions = defaultQueryOptions }: FetchFileProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["file", id, workspace];

    const query = useQuery<File>({
        queryKey,
        queryFn: async () => {
            const file = await getFile(api, id, workspace);
            return file;
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

export default useFetchFile;