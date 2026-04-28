import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import useAppAlert from "@src/hooks/useAppAlert";
import { getDatastore } from "@src/utils/api/datastore";
import { datastoreToObject } from "@src/utils/datastore";
import type { DatastoreWithRows } from "@src/types/datastore";
import type { EntityQueryOptions, FetchEntityParams } from "@src/types/entityQuery";

export type FetchDatastoreProps = FetchEntityParams<DatastoreWithRows>;

const defaultQueryOptions: EntityQueryOptions<DatastoreWithRows> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchDatastore
 *
 * Data-fetching hook built on TanStack Query to retrieve a single datastore by ID.
 *
 * It also:
 * - triggers an error alert via `useAppAlert` whenever `query.error` is present
 *
 * Important notes:
 * - Returns a `DatastoreWithRows` object: the full `Datastore` shape with `data`
 *   replaced by `DefaultObject[]` (rows transformed via `datastoreToObject`).
 *
 * Parameters (FetchDatastoreProps):
 * @param {string} id
 *   Datastore identifier (required).
 *
 * @param {string} workspace
 *   Workspace the datastore belongs to (required by `getDatastore`).
 *
 * @param {EntityQueryOptions<DatastoreWithRows>} [queryOptions=defaultQueryOptions]
 *   TanStack Query options passed through to `useQuery` (e.g., enabled, staleTime, gcTime, etc.).
 *
 * Returns:
 * @returns {object}
 *   TanStack Query's `query` object extended with:
 *   - `queryKey`: the cache key used by React Query
 *
 * Example:
 * ```ts
 * const { data, isLoading } = useFetchDatastore({
 *   id: "abc123",
 *   workspace: "my-workspace",
 * });
 * // data -> DatastoreWithRows (datastore metadata + rows as DefaultObject[])
 * // data.name -> "my-datastore"
 * // data.data -> [{ datastoreId: "abc123", col1: "value", ... }]
 * ```
 */
const useFetchDatastore = ({ id, workspace, queryOptions = defaultQueryOptions }: FetchDatastoreProps) => {

    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const queryKey = ["datastore", id, workspace];

    const query = useQuery<DatastoreWithRows>({
        queryKey,
        queryFn: async () => {
            const datastore = await getDatastore(api, id, workspace);

            return {
                ...datastore,
                data: datastoreToObject(
                    datastore.id,
                    datastore.data?.[0] as string[],
                    datastore.data
                ),
            };
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

export default useFetchDatastore;