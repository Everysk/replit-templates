import type { DefaultObject } from "../types/defaultObject";
import type { EntityQueryParams, FilterClause, FilterExpression } from "../types/entityQuery";

/**
 * Serializes a filter clause into the tuple-based filter expression expected by the API.
 *
 * The API supports two formats:
 * - [field, value] when the operator is omitted or equals "="
 * - [field, operator, value] when an explicit operator is provided and is not "="
 *
 * @param filter A filter clause in object form ({ field, op?, value }).
 * @returns A tuple-based filter expression to be sent to the API.
 *
 * @example
 * serializeFilter({ field: "workspace", value: "acme" });
 * // ["workspace", "acme"]
 *
 * @example
 * serializeFilter({ field: "created", op: ">=", value: "2025-01-01" });
 * // ["created", ">=", "2025-01-01"]
 */
export function serializeFilter(filter: FilterClause): FilterExpression {
  const { field, op, value } = filter;

  if (!op || op === "=") {
    return [field, value];
  }

  return [field, op, value];
}

/**
 * Builds the API query parameter object from strongly typed query params.
 *
 * Responsibilities:
 * - Converts `filters` from object form into tuple-based expressions using `serializeFilter`.
 * - Uses API naming conventions for pagination keys:
 *   - pageSize   -> page_size
 *   - pageToken  -> page_token
 * - Omits `projection` when it is empty/falsy.
 *
 * @param params Query parameters used for entity list/search endpoints.
 * @returns A plain object suitable to be used as query params (e.g., Axios `params`).
 *
 * @example
 * const apiParams = buildApiQueryParams({
 *   filters: [{ field: "workspace", value: "acme" }],
 *   order: ["created desc"],
 *   pageSize: 50,
 *   pageToken: "next",
 *   projection: "-name",
 * });
 * // {
 * //   filters: [["workspace", "acme"]],
 * //   order: ["created desc"],
 * //   projection: "id,name",
 * //   page_size: 50,
 * //   page_token: "next",
 * // }
 */
export function buildApiQueryParams(params: EntityQueryParams): DefaultObject {
  const { filters, pageSize, pageToken, order, projection } = params;

  return {
    filters: filters.map(serializeFilter),
    order,
    ...(projection ? { projection } : {}),
    page_size: pageSize,
    page_token: pageToken,
  };
}
