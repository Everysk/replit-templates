import type { Datastore } from "../../types/datastore";
import type { DefaultObject } from "../../types/defaultObject";

type Cell = string | number | null;
type DatastoreData = Cell[][];

/**
 * Converts a datastore table (2D array) into an array of objects.
 *
 * The input `data` is expected to be a 2D array where:
 * - Row 0 typically contains the headers (but headers are provided explicitly via `headers`)
 * - Rows 1..N contain the data values
 *
 * Key behaviors:
 * - Skips the first row of `data` (starts at index 1), assuming it is the header row.
 * - Adds a `datastoreId` field to every generated object so each record can be traced
 *   back to its source datastore.
 * - Maps each header to the corresponding cell value by column index.
 *
 * @template T A record type whose values are compatible with `Cell` (string | number | null).
 *
 * @param datastoreId The id of the datastore to attach to each row as `datastoreId`.
 * @param headers The column names used as object keys (positionally aligned with row cells).
 * @param data The datastore matrix (rows x columns). Row 0 is assumed to be headers.
 *
 * @returns An array of objects (one per data row), each containing:
 * - `datastoreId`
 * - one property per header (with the corresponding cell value)
 *
 * @example
 * const headers = ["name", "age"];
 * const data = [
 *   ["name", "age"],
 *   ["Alice", 30],
 *   ["Bob", null],
 * ];
 * const rows = datastoreToObject("ds_123", headers, data);
 * // [
 * //   { datastoreId: "ds_123", name: "Alice", age: 30 },
 * //   { datastoreId: "ds_123", name: "Bob", age: null }
 * // ]
 */
export const datastoreToObject = <T extends Record<string, Cell>>(datastoreId: string, headers: string[], data: DatastoreData): T[] => {
  const result: T[] = [];

  for (let i = 1; i < data?.length; i++) {
    const item: Record<string, Cell> = {};

    item.datastoreId = datastoreId;

    headers.forEach((header: string, index: number) => {
      item[header] = data[i][index];
    });

    result.push(item as T);
  }

  return result;
};

/**
 * Converts an array of objects into a datastore table (2D array).
 *
 * Key behaviors:
 * - Produces a 2D array where the first row is the provided `headers`.
 * - For each object in `data`, creates a row by mapping `headers` to values in the object.
 * - If a header is missing in an object, the corresponding cell is set to `null`.
 *
 * @template T A record type whose values are compatible with `Cell` (string | number | null).
 *
 * @param headers Column names (and output table header row).
 * @param data Array of objects to convert into rows.
 *
 * @returns A datastore matrix where:
 * - Row 0 is `headers`
 * - Rows 1..N contain cell values aligned with `headers`
 *
 * @example
 * const headers = ["name", "age"];
 * const rows = objectToDatastore(headers, [
 *   { name: "Alice", age: 30 },
 *   { name: "Bob" }, // age missing -> null
 * ]);
 * // [
 * //   ["name", "age"],
 * //   ["Alice", 30],
 * //   ["Bob", null]
 * // ]
 */
export const objectToDatastore = <T extends Record<string, Cell>>(headers: string[] ,data: T[]): DatastoreData => {
  const rows: DatastoreData = data.map((d) => headers.map<Cell>((h) => d[h as string] ?? null));

  return [headers, ...rows];
};

/**
 * Flattens multiple datastore row arrays into a single array.
 *
 * This is typically used after fetching multiple datastores, where each datastore is
 * represented as `DefaultObject[]` (i.e., an array of row objects).
 *
 * @param datastores A list of datastores, each represented as an array of row objects.
 *
 * @returns A single array containing all rows from all datastores, in the same order.
 *
 * @example
 * const merged = mergeDatastores([
 *   [{ datastoreId: "a", x: 1 }],
 *   [{ datastoreId: "b", x: 2 }, { datastoreId: "b", x: 3 }],
 * ]);
 * // [{...}, {...}, {...}]
 */
export const mergeDatastores = (datastores: DefaultObject[][]): DefaultObject[] => {
  const result: DefaultObject[] = [];

  datastores.forEach((datastore: DefaultObject[]) => {
    result.push(...datastore);
  });

  return result;
};

/**
 * mountDatastoreProps
 *
 * Extracts and maps the metadata properties of a `Datastore` into a plain object
 * for UI usage, discarding raw data rows.
 *
 * - `header` is derived from `datastore.data?.[0]` (the first row of the data matrix),
 *   which is expected to contain the column names. Falls back to `[]` if not present.
 *
 * @param {Datastore} datastore - The source datastore object.
 * @returns Metadata object with the datastore's descriptive properties and header.
 *
 * @example
 * const meta = mountDatastoreProps(datastore);
 * // {
 * //   name: "my-datastore",
 * //   workspace: "ws-1",
 * //   header: ["col1", "col2"],
 * //   ...
 * // }
 */
export const mountDatastoreProps = (datastore: Datastore) => {
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