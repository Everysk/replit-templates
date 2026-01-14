import { useEffect, useRef } from "react";

import { useQuery, } from "@tanstack/react-query";

import useAxios from "./useAxios";
import useAppAlert from "./useAppAlert"
import { buildApiQueryParams } from "../utils/apiQuery";
import type { DefaultObject } from "../types/defaultObject";
import { getDatastore, getDatastores } from "../utils/api/datastore";
import { datastoreToObject, mergeDatastores } from "../utils/datastore";
import type { EntityQueryOptions, FetchEntityParams } from "../types/entityQuery";


export type FetchDatastoreProps<TData = DefaultObject, TSelected = TData> = FetchEntityParams<TData, TSelected> & {
    mergeResult?: boolean;
};

const mountDatastoreProps = (datastore: DefaultObject) => {
    return {
        name: datastore.name,
        date: datastore.date,
        version: datastore.version,
        description: datastore.description,
        tags: datastore.tags,
        link_uid: datastore.link_uid,
        workspace: datastore.workspace,
        date_time: datastore.date_time,
        created: datastore.created,
        updated: datastore.updated,
        level: datastore.level,
        storage: datastore.storage,
        header: datastore.data?.[0] || [],
    };
};

const defaultQueryOptions: EntityQueryOptions<DefaultObject[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0
}

/**
 * useFetchDatastore
 *
 * Data-fetching hook built on TanStack Query to retrieve:
 * - a single datastore (when `id` is provided), or
 * - a list of datastores (when `id` is null)
 *
 * It also:
 * - builds a helper map `datastoresProps` (metadata keyed by datastore `id`) for UI usage
 * - optionally merges list results into a single array when `mergeResult` is true
 *
 * Important notes:
 * - The query return shape varies by scenario:
 *   - If `id` is provided: returns `DefaultObject[]` (rows for that datastore)
 *   - If `id` is null and `mergeResult` is false: returns `DefaultObject[][]` (rows grouped by datastore)
 *   - If `id` is null and `mergeResult` is true: returns `DefaultObject[]` (merged/flattened result)
 *
 * - Each returned row is augmented with the datastore identifier:
 *   - `datastoreToObject(...)` adds a datastore id field to every row, so downstream consumers
 *     can trace each record back to its source datastore.
 *
 * - The hook triggers an error alert via `useAppAlert` whenever `query.error` is present.
 *
 * Parameters (FetchDatastoreProps):
 * @param {string | null} id
 *  Datastore identifier. If provided, fetches only that datastore.
 *  If null, fetches the datastore list using filters/ordering.
 *
 * @param {FilterClause[]} [filters=[]]
 *  Filters applied to the request.
 *  When `id` is provided, a `workspace` filter is expected because `getDatastore`
 *  requires a `workspace` value.
 *
 * @param {string[]} [order=[]]
 *  Sorting applied to list requests (when `id` is null).
 *
 * @param {string} [projection=""]
 *  Projection/fields requested from the API (if supported). If empty, projection is omitted.
 *
 * @param {boolean} [mergeResult=false]
 *  Only applicable when `id` is null.
 *  - false: returns one list per datastore (DefaultObject[][])
 *  - true: returns all rows merged into a single array (DefaultObject[])
 *
 * @param {EntityQueryOptions<any>} [queryOptions=defaultQueryOptions]
 *  TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *  Note: must be compatible with the actual query function return type.
 *
 * Returns:
 * @returns {object}
 *  Returns TanStack Query's `query` object extended with:
 *  - `queryKey`: the cache key used by React Query
 *  - `datastoresProps`: a map of datastore metadata keyed by datastore id
 *
 * Examples:
 *
 * 1) Fetch a single datastore:
 * ```ts
 * const { data, isLoading, datastoresProps } = useFetchDatastore({
 *   id: "abc123",
 *   filters: [{ field: "workspace", value: "my-workspace" }],
 * });
 * // data -> DefaultObject[] (rows, each including the datastore id field)
 * // datastoresProps["abc123"] -> metadata built from the datastore
 * ```
 *
 * 2) Fetch a list of datastores without merging:
 * ```ts
 * const { data } = useFetchDatastore({
 *   id: null,
 *   filters: [{ field: "workspace", value: "my-workspace" }],
 *   order: ["created desc"],
 *   mergeResult: false,
 * });
 * // data -> DefaultObject[][] (rows grouped by datastore, each row includes its datastore id)
 * ```
 *
 * 3) Fetch a list of datastores with merging:
 * ```ts
 * const { data } = useFetchDatastore({
 *   id: null,
 *   filters: [{ field: "workspace", value: "my-workspace" }],
 *   mergeResult: true,
 * });
 * // data -> DefaultObject[] (merged rows, each row includes its datastore id)
 * ```
 */

const useFetchDatastore = ({ id = null, filters = [], order = [], projection = "", mergeResult = false, queryOptions = defaultQueryOptions }: FetchDatastoreProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const datastoresProps = useRef<DefaultObject>({});

    const queryFilter = buildApiQueryParams({ filters, order, projection });
    const queryKey = [
        "datastore",
        id,
        ...filters.flatMap((filter) => filter.value)
    ];

    const query = useQuery<DefaultObject[]>({
        queryKey,
        queryFn: async () => {

            if (id) {
                const datastore = await getDatastore(
                    api,
                    id,
                    filters.find(filter => filter.field === "workspace")?.value as string
                );

                datastoresProps.current[id] = mountDatastoreProps(datastore);

                return datastoreToObject(
                    datastore.id as string,
                    datastore.data?.[0] as string[],
                    datastore.data
                );
            }

            const datastores = await getDatastores(api, queryFilter);

            const data: DefaultObject[][] = datastores.map((_datastore: DefaultObject) => {
                datastoresProps.current[_datastore.id] = mountDatastoreProps(_datastore);

                return datastoreToObject(
                    _datastore.id,
                    _datastore.data?.[0],
                    _datastore.data
                );
            });

            if (mergeResult) {
                return mergeDatastores(data);
            }

            return data;

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
        datastoresProps: datastoresProps.current,
    };
};

export default useFetchDatastore;