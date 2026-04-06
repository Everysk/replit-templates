import type { FilterClause, FilterExpression, EntityQueryParams, QueryObject } from "../../types/entityQuery";

/**
 * toFilterTuple
 *
 * Converts a `FilterClause` object into a `FilterExpression` tuple
 * compatible with the API query format.
 *
 * - If no operator is provided or operator is `"="`, returns a 2-tuple `[field, value]`.
 * - Otherwise, returns a 3-tuple `[field, op, value]`.
 *
 * @param {FilterClause} filter - Filter clause to convert.
 * @returns {FilterExpression} Tuple representation of the filter.
 *
 * Examples:
 * ```ts
 * toFilterTuple({ field: "workspace", value: "ws-1" })
 * // -> ["workspace", "ws-1"]
 *
 * toFilterTuple({ field: "age", op: ">=", value: 18 })
 * // -> ["age", ">=", 18]
 * ```
 */
export const toFilterTuple = (filter: FilterClause): FilterExpression => {
    const { field, op, value } = filter;
    if (!op || op === '=') {
        return [field, value];
    }
    return [field, op, value];
};

/**
 * buildQueryObject
 *
 * Builds the query payload object to be sent to the API,
 * converting filters, ordering, pagination, and projection into the expected format.
 *
 * @param {EntityQueryParams} params - Query parameters.
 * @param {FilterClause[]} params.filters - Filters to apply (converted via `toFilterTuple`).
 * @param {string[]} params.order - Sorting fields.
 * @param {number} [params.pageSize] - Number of items per page.
 * @param {string} [params.pageToken] - Cursor token for the next page.
 * @param {string} [params.projection] - Field to project. Omitted from payload if empty.
 * @returns {QueryObject} Query payload ready to be passed to the API.
 *
 * Example:
 * ```ts
 * buildQueryObject({
 *   filters: [{ field: "workspace", value: "ws-1" }],
 *   order: ["created desc"],
 *   pageSize: 10,
 *   pageToken: "token-abc",
 *   projection: "name",
 * });
 * // -> {
 * //   filters: [["workspace", "ws-1"]],
 * //   order: ["created desc"],
 * //   projection: "name",
 * //   page_size: 10,
 * //   page_token: "token-abc",
 * // }
 * ```
 */
export const buildQueryObject = (params: EntityQueryParams): QueryObject => {
    const { filters, pageSize, pageToken, order, projection } = params;

    return {
        filters: filters.map(toFilterTuple),
        order,
        ...(!!projection && { projection }),
        page_size: pageSize,
        page_token: pageToken,
    };
}

/**
 * buildQueryKey
 *
 * Builds a stable React Query cache key by combining a base key array
 * with the values of the provided filters.
 *
 * This ensures the query is re-executed whenever filter values change.
 *
 * @param {(string | number)[]} keys - Base keys (e.g. entity name, id).
 * @param {FilterClause[]} filters - Filters whose values are appended to the key.
 * @returns {unknown[]} Cache key array for use in `queryKey`.
 *
 * Example:
 * ```ts
 * buildQueryKey(["datastores"], [{ field: "workspace", value: "ws-1" }]);
 * // -> ["datastores", "ws-1"]
 * ```
 */
export const buildQueryKey = (keys: (string | number)[], filters: FilterClause[]): unknown[] => {
    return [
        ...keys,
        ...filters.flatMap((filter) => filter.value)
    ];
}