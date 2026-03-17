import type { DefaultObject } from "./defaultObject";
import type { EntitySingleResponse, EntityListResponse, DeleteEntityResponse } from "./entityQuery";

export type DatastoreRow = string | number | null;
export type DatastoreData = DatastoreRow[][];

export type Datastore = {
    updated?: number,
    created?: number,

    id: string,
    name: string,
    date?: string,
    version?: string,
    description?: string,

    tags?: string[],
    link_uid?: string,
    workspace: string,
    data: DatastoreData,
    date_time: string,
    level?: string,
    storage?: string,
}

export type DatastoreWithRows = Omit<Datastore, "data"> & {
    data: DefaultObject[];
};

export type DatastoreSingleResponse = EntitySingleResponse<"datastore", Datastore>;

export type DatastoreListResponse = EntityListResponse<"datastores", Datastore>;

export type DeleteDatastoreResponse = DeleteEntityResponse<"datastores">;