import { toFilterTuple, buildQueryObject, buildQueryKey } from ".";

describe("toFilterTuple", () => {
    it("returns a 2-tuple when no operator is provided", () => {
        expect(toFilterTuple({ field: "workspace", value: "ws-1" })).toEqual(["workspace", "ws-1"]);
    });

    it("returns a 2-tuple when operator is '='", () => {
        expect(toFilterTuple({ field: "status", op: "=", value: "active" })).toEqual(["status", "active"]);
    });

    it("returns a 3-tuple when a non-equality operator is provided", () => {
        expect(toFilterTuple({ field: "age", op: ">=", value: 18 })).toEqual(["age", ">=", 18]);
    });
});

describe("buildQueryObject", () => {
    it("converts filters to tuples", () => {
        const result = buildQueryObject({
            filters: [{ field: "workspace", value: "ws-1" }],
            order: [],
        });
        expect(result.filters).toEqual([["workspace", "ws-1"]]);
    });

    it("includes projection when non-empty", () => {
        const result = buildQueryObject({ filters: [], order: [], projection: "name" });
        expect(result.projection).toBe("name");
    });

    it("omits projection when empty", () => {
        const result = buildQueryObject({ filters: [], order: [], projection: "" });
        expect(result).not.toHaveProperty("projection");
    });

    it("includes pageSize and pageToken", () => {
        const result = buildQueryObject({ filters: [], order: [], pageSize: 10, pageToken: "tok" });
        expect(result.page_size).toBe(10);
        expect(result.page_token).toBe("tok");
    });
});

describe("buildQueryKey", () => {
    it("appends filter values to base keys", () => {
        const result = buildQueryKey(["datastores"], [{ field: "workspace", value: "ws-1" }]);
        expect(result).toEqual(["datastores", "ws-1"]);
    });

    it("appends multiple filter values", () => {
        const result = buildQueryKey(["items", "id-1"], [
            { field: "workspace", value: "ws-1" },
            { field: "status", value: "active" },
        ]);
        expect(result).toEqual(["items", "id-1", "ws-1", "active"]);
    });
});
