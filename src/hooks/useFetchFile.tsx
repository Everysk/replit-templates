import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "./useAxios";
import type { File } from "../types/file";
import useAppAlert from "./useAppAlert";
import { getFile, getFiles } from "../utils/api/file";
import { buildApiQueryParams } from "../utils/apiQuery";
import type { EntityQueryOptions, FetchEntityParams } from "../types/entityQuery";

export type FetchFileProps<TData = File, TSelected = TData> = FetchEntityParams<TData, TSelected>;

const defaultQueryOptions: EntityQueryOptions<File[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}

/**
 * useFetchFile
 *
 * Data-fetching hook built on TanStack Query to retrieve:
 * - a single file (when `id` is provided), or
 * - a list of files (when `id` is null)
 *
 * It also:
 * - builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * Important notes:
 * - The query always returns `File[]`:
 *   - If `id` is provided: returns `[File]` (single-item array)
 *   - If `id` is null: returns `File[]` (list)
 *
 * - When `id` is provided, a `workspace` filter is expected because `getFile`
 *   requires a `workspace` value.
 *
 * - File content:
 *   - `File.data` represents the file content and is expected to be a Base64-encoded string when provided
 *     by the API (or when sending content through mutations).
 *
 * Parameters (FetchFileProps):
 * @param {string | null} id
 *  File identifier. If provided, fetches only that file.
 *  If null, fetches the file list using filters/ordering.
 *
 * @param {FilterClause[]} [filters=[]]
 *  Filters applied to the request.
 *  When `id` is provided, a `workspace` filter is expected because `getFile`
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
 *   `const fetch = useFetchFile(...);`
 *   `useFileMutations({ queryKey: fetch.queryKey });`
 *
 * Examples:
 *
 * 1) Fetch a single file:
 * ```ts
 * const { data, isLoading } = useFetchFile({
 *   id: "file-123",
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 * // data -> File[] (single-item array)
 * ```
 *
 * 2) Fetch a list of files:
 * ```ts
 * const { data } = useFetchFile({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   order: ["created desc"],
 * });
 * // data -> File[]
 * ```
 *
 * 3) Reuse queryKey for invalidation in mutations:
 * ```ts
 * const fetch = useFetchFile({
 *   id: null,
 *   filters: [{ field: "workspace", value: "ws-1" }],
 * });
 *
 * const { create } = useFileMutations({ queryKey: fetch.queryKey });
 *
 * await create.mutateAsync({
 *   data: {
 *     name: "My file",
 *     workspace: "ws-1",
 *     content_type: "text/plain",
 *     version: "1",
 *     link_uid: null,
 *     data: "SGVsbG8gd29ybGQ=", // Base64 content
 *   }
 * });
 * ```
 */


const useFetchFile = ({ id = null, filters = [], order = [], projection = "", queryOptions = defaultQueryOptions }: FetchFileProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();


    const queryFilter = buildApiQueryParams({ filters, order, projection });

    const queryKey = [
        "file",
        id,
        ...filters.flatMap((filter) => filter.value)
    ];

    const query = useQuery<File[]>({
        queryKey,
        queryFn: async () => {

            if (id) {

                const file = await getFile(
                    api,
                    id,
                    filters.find(filter => filter.field === "workspace")?.value as string
                );

                return [file];

            }

            const files = await getFiles(api, queryFilter);

            return files;
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