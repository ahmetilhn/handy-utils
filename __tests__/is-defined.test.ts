import isDefined from "@/modules/is-defined";

describe("isDefined tests", () => {
  test("should return true for primitive values", () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined("")).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(NaN)).toBe(true);
  });

  test("should return true for objects and arrays", () => {
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
    expect(isDefined(new Date())).toBe(true);
  });

  test("should return true for functions", () => {
    expect(isDefined(() => {})).toBe(true);
  });

  test("should return false for undefined", () => {
    expect(isDefined(undefined)).toBe(false);
    const obj = {} as Record<string, string>;
    expect(isDefined(obj.name)).toBe(false);
  });

  test("should return false for null", () => {
    expect(isDefined(null)).toBe(false);
  });
});
