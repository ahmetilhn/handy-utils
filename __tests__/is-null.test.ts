import isNull from "@/modules/is-null";

describe("isNull tests", () => {
  test("should return true for null", () => {
    expect(isNull(null)).toBe(true);
  });

  test("should return false for undefined", () => {
    expect(isNull(undefined)).toBe(false);
  });

  test("should return false for primitive values", () => {
    expect(isNull(0)).toBe(false);
    expect(isNull("")).toBe(false);
    expect(isNull(false)).toBe(false);
    expect(isNull(NaN)).toBe(false);
  });

  test("should return false for objects and arrays", () => {
    expect(isNull({})).toBe(false);
    expect(isNull([])).toBe(false);
    expect(isNull(new Date())).toBe(false);
  });

  test("should return false for functions", () => {
    expect(isNull(() => {})).toBe(false);
  });
});
