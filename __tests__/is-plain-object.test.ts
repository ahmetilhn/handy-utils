import isPlainObject from "@/modules/is-plain-object";
describe("isPlainObject tests", () => {
  test("it should return true when got empty plain object", () => {
    expect(isPlainObject({})).toBeTruthy();
  });

  test("it should return false when got Date", () => {
    expect(isPlainObject(new Date())).toBeFalsy();
  });

  test("it should return false when got null or undefined", () => {
    expect(isPlainObject(null)).toBeFalsy();
    expect(isPlainObject(undefined)).toBeFalsy();
  });

  test("it should return true when got object has record", () => {
    expect(isPlainObject({ name: "John" })).toBeTruthy();
  });

  test("it should return true when got object with nested object", () => {
    expect(
      isPlainObject({
        user: {
          name: "John",
        },
      })
    ).toBeTruthy();
  });

  test("it should return false when got empty array or array has size", () => {
    expect(isPlainObject([])).toBeFalsy();
    expect(isPlainObject([1, 2, 3])).toBeFalsy();
  });

  test("it should return true when got a prototype-less object", () => {
    expect(isPlainObject(Object.create(null))).toBeTruthy();
    expect(isPlainObject(new Object())).toBeTruthy();
  });

  test("it should return false for built-ins that keep state in internal slots", () => {
    expect(isPlainObject(new Map())).toBeFalsy();
    expect(isPlainObject(new Set())).toBeFalsy();
    expect(isPlainObject(new WeakMap())).toBeFalsy();
    expect(isPlainObject(/regex/)).toBeFalsy();
    expect(isPlainObject(new Error("boom"))).toBeFalsy();
    expect(isPlainObject(new URL("https://example.com"))).toBeFalsy();
    expect(isPlainObject(Promise.resolve())).toBeFalsy();
    expect(isPlainObject(new Uint8Array([1]))).toBeFalsy();
  });

  test("it should return false for class instances", () => {
    class Person {
      constructor(public name: string) {}
    }
    expect(isPlainObject(new Person("Ada"))).toBeFalsy();
  });

  test("it should return false for primitives and functions", () => {
    expect(isPlainObject(1)).toBeFalsy();
    expect(isPlainObject("a")).toBeFalsy();
    expect(isPlainObject(true)).toBeFalsy();
    expect(isPlainObject(Symbol("s"))).toBeFalsy();
    expect(isPlainObject(() => {})).toBeFalsy();
  });

  test("it should return true for objects inheriting directly from Object.prototype", () => {
    expect(isPlainObject(Object.create(Object.prototype))).toBeTruthy();
  });

  test("it should return false for objects with a custom prototype chain", () => {
    expect(isPlainObject(Object.create({ a: 1 }))).toBeFalsy();
  });
});
