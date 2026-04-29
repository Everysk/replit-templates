import { datastoreToObject, objectToDatastore, mergeDatastores, mountDatastoreProps } from ".";
import type { Datastore } from "@src/types/datastore";

describe("datastoreToObject", () => {
    it("converts rows to objects using the provided headers", () => {
        const result = datastoreToObject("ds-1", ["name", "age"], [
            ["name", "age"],
            ["Alice", 30],
            ["Bob", 25],
        ]);

        expect(result).toEqual([
            { datastoreId: "ds-1", name: "Alice", age: 30 },
            { datastoreId: "ds-1", name: "Bob", age: 25 },
        ]);
    });

    it("skips the first row of data (header row)", () => {
        const result = datastoreToObject("ds-1", ["x"], [["x"], [1], [2]]);
        expect(result).toHaveLength(2);
        expect(result[0].x).toBe(1);
    });

    it("attaches datastoreId to every row", () => {
        const result = datastoreToObject("ds-42", ["val"], [["val"], ["a"]]);
        expect(result[0].datastoreId).toBe("ds-42");
    });

    it("maps null cell values", () => {
        const result = datastoreToObject("ds-1", ["name", "age"], [
            ["name", "age"],
            ["Bob", null],
        ]);
        expect(result[0].age).toBeNull();
    });

    it("returns an empty array when data has only the header row", () => {
        const result = datastoreToObject("ds-1", ["name"], [["name"]]);
        expect(result).toEqual([]);
    });

    it("returns an empty array when data is empty", () => {
        const result = datastoreToObject("ds-1", ["name"], []);
        expect(result).toEqual([]);
    });
});

describe("objectToDatastore", () => {
    it("produces a 2D array with headers as the first row", () => {
        const result = objectToDatastore(["name", "age"], [
            { name: "Alice", age: 30 },
        ]);

        expect(result[0]).toEqual(["name", "age"]);
    });

    it("maps object values to cells aligned with headers", () => {
        const result = objectToDatastore(["name", "age"], [
            { name: "Alice", age: 30 },
            { name: "Bob", age: 25 },
        ]);

        expect(result[1]).toEqual(["Alice", 30]);
        expect(result[2]).toEqual(["Bob", 25]);
    });

    it("uses null for missing keys", () => {
        const result = objectToDatastore(["name", "age"], [{ name: "Bob" } as Record<string, string | number | null>]);
        expect(result[1]).toEqual(["Bob", null]);
    });

    it("returns only the header row when data is empty", () => {
        const result = objectToDatastore(["name"], []);
        expect(result).toEqual([["name"]]);
    });
});

describe("mergeDatastores", () => {
    it("flattens multiple datastore row arrays into one", () => {
        const result = mergeDatastores([
            [{ datastoreId: "a", x: 1 }],
            [{ datastoreId: "b", x: 2 }, { datastoreId: "b", x: 3 }],
        ]);

        expect(result).toHaveLength(3);
        expect(result[0].datastoreId).toBe("a");
        expect(result[2].x).toBe(3);
    });

    it("preserves order across datastores", () => {
        const result = mergeDatastores([[{ n: 1 }], [{ n: 2 }], [{ n: 3 }]]);
        expect(result.map((r) => r.n)).toEqual([1, 2, 3]);
    });

    it("returns an empty array for empty input", () => {
        expect(mergeDatastores([])).toEqual([]);
    });

    it("returns an empty array when all datastores are empty", () => {
        expect(mergeDatastores([[], []])).toEqual([]);
    });
});

describe("mountDatastoreProps", () => {
    const baseDatastore: Datastore = {
        id: "ds-1",
        name: "my-ds",
        workspace: "ws-1",
        date: "2024-01-01",
        version: "1",
        description: "desc",
        tags: ["a"],
        link_uid: undefined,
        date_time: "2024-01-01T00:00:00Z",
        created: 0,
        updated: 0,
        level: "private",
        storage: "default",
        data: [["col1", "col2"], ["v1", "v2"]],
    };

    it("extracts all metadata fields", () => {
        const result = mountDatastoreProps(baseDatastore);

        expect(result.name).toBe("my-ds");
        expect(result.workspace).toBe("ws-1");
        expect(result.description).toBe("desc");
        expect(result.tags).toEqual(["a"]);
    });

    it("sets header from the first row of data", () => {
        const result = mountDatastoreProps(baseDatastore);
        expect(result.header).toEqual(["col1", "col2"]);
    });

    it("falls back to empty array when data is absent", () => {
        const result = mountDatastoreProps({ ...baseDatastore, data: undefined } as unknown as Datastore);
        expect(result.header).toEqual([]);
    });

    it("falls back to empty array when data is empty", () => {
        const result = mountDatastoreProps({ ...baseDatastore, data: [] });
        expect(result.header).toEqual([]);
    });
});
