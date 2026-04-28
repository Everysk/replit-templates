//import { useCallback, useMemo, useRef } from "react";
import { useMemo } from "react";
import { useInfiniteQuery, type UseInfiniteQueryOptions, type QueryKey } from "@tanstack/react-query";

//import type { GridApi } from "ag-grid-community";

import useAxios from "@src/hooks/useAxios";
import { datastoreToObject } from "@src/utils/datastore";
import { getDatastores } from "@src/utils/api/datastore";

import type { Datastore, DatastoreListResponse, DatastoreWithRows } from "@src/types/datastore";
import type { FetchEntitiesParams, EntityDefaultResponse } from "@src/types/entityQuery";
import { buildQueryKey, buildQueryObject } from "@src/utils/api/entityQuery";

type PageToken = string | null;

type InfiniteOptions<TData> = Omit<
    UseInfiniteQueryOptions<DatastoreQueryPage, Error, TData, QueryKey, PageToken>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;


export type DatastoreQueryPage = EntityDefaultResponse & {
    datastores: DatastoreWithRows[];
};

export type FetchInfiniteDatastoreProps = FetchEntitiesParams<DatastoreWithRows[], InfiniteOptions<DatastoreWithRows[]>> & {
    pageSize?: number;
};

const defaultQueryOptions: InfiniteOptions<DatastoreWithRows[]> = {
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
};

/**
 * useFetchDatastores
 *
 * Data-fetching hook built on TanStack Query's `useInfiniteQuery` to retrieve
 * datastores with cursor-based pagination.
 *
 * It also:
 * - flattens all pages into a single `DatastoreWithRows[]` via `select`
 * - exposes `actions` for cache management
 * - exposes `events` for ag-Grid integration
 *
 * Important notes:
 * - `query.data` returns a flat `DatastoreWithRows[]` (all pages merged).
 * - Each item retains the full `Datastore` shape, with `data` replaced by `DefaultObject[]` (rows transformed via `datastoreToObject`).
 *
 * Parameters (FetchInfiniteDatastoreProps):
 * @param {FilterClause[]} [filters=[]]
 *   Filters applied to every page request. Must include a `workspace` filter.
 *
 * @param {string[]} [order=[]]
 *   Sorting applied to every page request.
 *
 * @param {string} [projection=""]
 *   Fields to project from the API. Omitted from the request if empty.
 *
 * @param {number} [pageSize=10]
 *   Number of datastores to fetch per page.
 *
 * @param {InfiniteOptions<DatastoreWithRows[]>} [queryOptions]
 *   TanStack Query options passed through to `useInfiniteQuery`
 *   (e.g., enabled, staleTime, gcTime, etc.).
 *
 * Returns:
 * @returns {object}
 *   - `query`: the full `useInfiniteQuery` result (data, isLoading, hasNextPage, fetchNextPage, etc.)
 *   - `queryKey`: the cache key used by React Query
 *   - `events.handleFetchIfGridEmptyOrNearEnd(gridApi)`: triggers next page fetch when the ag-Grid is empty or near the end of the list
 *
 * Example:
 * ```ts
 * const { query, events } = useFetchDatastores({
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   pageSize: 20,
 * });
 *
 * // Flat list of all fetched datastores with transformed rows
 * const datastores = query.data ?? [];
 *
 * // Load next page when grid is near end
 * <AgGridReact onBodyScroll={() => events.handleFetchIfGridEmptyOrNearEnd(gridApi)} />
 * ```
 */
export function useFetchDatastores({ filters = [], order = [], projection = "", pageSize = 10, queryOptions }: FetchInfiniteDatastoreProps) {
    const { api } = useAxios();

    //const fetchingGuardRef = useRef(false);
    const queryKey = buildQueryKey(["datastores"], filters);

    const mergedQueryOptions = useMemo<InfiniteOptions<DatastoreWithRows[]>>(() => ({
        ...defaultQueryOptions,
        ...(queryOptions ?? {}),
    }), [queryOptions]);

    const query = useInfiniteQuery<DatastoreQueryPage, Error, DatastoreWithRows[], QueryKey, PageToken>({
        queryKey,
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.next_page_token ?? undefined,

        queryFn: async ({ pageParam }) => {
            const queryFilter = buildQueryObject({
                filters,
                order,
                projection,
                pageSize,
                pageToken: pageParam ?? undefined,
            });

            const response: DatastoreListResponse = await getDatastores(api, queryFilter);

            const nested: DatastoreWithRows[] = response.datastores.map((datastore: Datastore) => ({
                ...datastore,
                data: datastoreToObject(
                    datastore.id,
                    datastore.data?.[0] as string[],
                    datastore.data
                ),
            }));

            return {
                next_page_token: response.next_page_token,
                datastores: nested,
            };
        },

        select: (data) => data.pages.flatMap((p) => p.datastores),

        ...mergedQueryOptions,
    });

    /*
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
    const handleFetchIfGridEmptyOrNearEnd = useCallback((gridApi: GridApi) => {
        if (!hasNextPage || isFetchingNextPage || fetchingGuardRef.current) return;

        const total = gridApi.getDisplayedRowCount();
        const last = gridApi.getLastDisplayedRowIndex();

        const isEmpty = total === 0 || last < 0;
        const isNearEnd = !isEmpty && (total - 1 - last) <= 30;

        if (!isEmpty && !isNearEnd) return;

        fetchingGuardRef.current = true;
        fetchNextPage().finally(() => {
            fetchingGuardRef.current = false;
        });
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
    */

    return {
        query,
        queryKey,
        //events: { handleFetchIfGridEmptyOrNearEnd },
    };
}