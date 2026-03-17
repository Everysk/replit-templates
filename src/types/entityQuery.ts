import type { UseQueryOptions } from "@tanstack/react-query";
import type { DefaultObject } from "./defaultObject";

export type FilterOperator = "=" | ">" | ">=" | "<" | "<=" | "!=";

export type FilterExpression =
  | [field: string, value: unknown]
  | [field: string, op: FilterOperator, value: unknown];

export type FilterClause = {
  field: string;
  value: unknown;
  op?: FilterOperator;
}

export type BaseQueryParams = {
  order: string[];
  projection?: string;
}

export type EntityQueryParams = BaseQueryParams & {
  filters: FilterClause[];
  pageSize?: number;
  pageToken?: string;
}

export type QueryObject = BaseQueryParams & {
  filters: FilterExpression[];
  page_size?: number;
  page_token?: string;
};

export type EntityQueryOptions<TQueryFnData, TData = TQueryFnData> = Omit<UseQueryOptions<TQueryFnData, Error, TData>,"queryKey" | "queryFn">;

export type FetchEntityParams<TData = DefaultObject, TSelected = TData> = {
  id: string;
  workspace: string;
  queryOptions?: EntityQueryOptions<TData, TSelected>;
};

export type FetchEntitiesParams<TData = DefaultObject, QO = EntityQueryOptions<TData>> = {
    filters?: FilterClause[];
    order?: string[];
    projection?: string;
    queryOptions?: QO;
};


export type EntityDefaultResponse = {
    next_page_token: string | null;
}

export type EntitySingleResponse<K extends string, T> = EntityDefaultResponse & Record<K, T>;

export type EntityListResponse<K extends string, T> = EntityDefaultResponse & Record<K, T[]>;

export type DeleteEntityDefaultResponse = {
  id:string,
  name:string,
  deleted:boolean
}

export type DeleteEntityResponse<K extends string, T = DeleteEntityDefaultResponse> = Record<K, T[]>;
  