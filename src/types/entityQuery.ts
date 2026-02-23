import type { UseQueryOptions } from "@tanstack/react-query";
import type { DefaultObject } from "./defaultObject";

export type FilterOperator = "=" | ">" | ">=" | "<" | "<=" | "!=";

export type FilterExpression =
  | [field: string, value: unknown]
  | [field: string, op: FilterOperator, value: unknown];

export interface FilterClause {
  field: string;
  value: unknown;
  op?: FilterOperator;
}

export interface EntityQueryParams {
  filters: FilterClause[];
  order: string[];
  pageSize?: number;
  pageToken?: string;
  projection?: string;
}

export type EntityQueryOptions<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, Error, TData>,
  "queryKey" | "queryFn"
>;

export type FetchEntityParams<TData = DefaultObject, TSelected = TData> = {
  id: string | null;
  filters?: FilterClause[];
  order?: string[];
  projection?: string;
  queryOptions?: EntityQueryOptions<TData[], TSelected[]>;
};
