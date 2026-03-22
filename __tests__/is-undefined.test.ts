import isUndefined from "@/modules/is-undefined";

describe("isUndefined tests", () => {
  test("should return true for undefined", () => {
    expect(isUndefined(undefined)).toBe(true);
  });

  test("should return true for missing object property", () => {
    const obj = {} as Record<string, string>;
    expect(isUndefined(obj.name)).toBe(true);
  });

  test("should return false for null", () => {
    expect(isUndefined(null)).toBe(false);
  });

  test("should return false for primitive values", () => {
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined("")).toBe(false);
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined(NaN)).toBe(false);
  });

  test("should return false for objects and arrays", () => {
    expect(isUndefined({})).toBe(false);
    expect(isUndefined([])).toBe(false);
  });
});
