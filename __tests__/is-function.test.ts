import isFunction from "@/modules/is-function";
describe("isFunction tests", () => {
  test("should return false while param is equal NaN", () => {
    expect(isFunction(NaN)).toBeFalsy();
  });
  test("should return false while param is equal undefined", () => {
    expect(isFunction(undefined)).toBeFalsy();
  });
  test("should return false while param is equal null", () => {
    expect(isFunction(null)).toBeFalsy();
  });
  test("should return false while param is equal array", () => {
    expect(isFunction([])).toBeFalsy();
  });
  test("should return false while param is equal object", () => {
    expect(isFunction({})).toBeFalsy();
  });
  test("should return true while param is equal function", () => {
    expect(isFunction(() => {})).toBeTruthy();
  });

  test("should return true for every callable form", () => {
    expect(isFunction(function named() {})).toBeTruthy();
    expect(isFunction(async () => {})).toBeTruthy();
    expect(isFunction(async function named() {})).toBeTruthy();
    expect(isFunction(function* gen() {})).toBeTruthy();
    expect(isFunction(async function* asyncGen() {})).toBeTruthy();
    expect(isFunction(class Foo {})).toBeTruthy();
    expect(isFunction(Math.max)).toBeTruthy();
  });

  test("should return false for non-callable values", () => {
    expect(isFunction(0)).toBeFalsy();
    expect(isFunction("fn")).toBeFalsy();
    expect(isFunction(Symbol("s"))).toBeFalsy();
    expect(isFunction(new Date())).toBeFalsy();
    expect(isFunction(/regex/)).toBeFalsy();
  });
});
