import isNumber from "@/modules/is-number";
describe("isNumber tests", () => {
  test("should return false while param is equal object", () => {
    expect(isNumber({})).toBeFalsy();
  });
  test("should return false while param is equal null", () => {
    expect(isNumber(null)).toBeFalsy();
  });
  test("should return false while param is equal undefined", () => {
    expect(isNumber(undefined)).toBeFalsy();
  });
  test("should return false while param is equal array", () => {
    expect(isNumber([])).toBeFalsy();
  });
  test("should return true while param is equal number", () => {
    expect(isNumber(191)).toBeTruthy();
  });
  test("should return true while param is equal NaN", () => {
    expect(isNumber(NaN)).toBeFalsy();
  });
});

describe("isNumber finiteness", () => {
  test("should reject Infinity and -Infinity", () => {
    expect(isNumber(Infinity)).toBe(false);
    expect(isNumber(-Infinity)).toBe(false);
  });

  test("should still accept ordinary finite numbers", () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-0)).toBe(true);
    expect(isNumber(-5.5)).toBe(true);
    expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  test("should reject numeric strings and boxed numbers", () => {
    expect(isNumber("5")).toBe(false);
    // eslint-disable-next-line no-new-wrappers
    expect(isNumber(new Number(5))).toBe(false);
  });
});
