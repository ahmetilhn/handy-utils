import * as handyUtils from "@/index";
import NodeEnum from "@/enums/NodeEnum";

const EXPECTED_EXPORTS = [
  "debounce",
  "deepClone",
  "isArray",
  "isObject",
  "isBoolean",
  "isDate",
  "isDeepEqual",
  "isFunction",
  "isNumber",
  "isPlainObject",
  "hasPlainObjectRecord",
  "sleep",
  "isDefined",
  "isUndefined",
  "isNull",
  "isServer",
  "isClient",
  "isAndroid",
  "isIos",
  "withRetry",
  "watcher",
  "normalize",
] as const;

describe("public entry point", () => {
  test("should expose every documented export as a function", () => {
    for (const name of EXPECTED_EXPORTS) {
      expect(typeof handyUtils[name]).toBe("function");
    }
  });

  test("should not expose anything beyond the documented surface", () => {
    expect(Object.keys(handyUtils).sort()).toEqual([...EXPECTED_EXPORTS].sort());
  });

  test("exports should be usable through the barrel", () => {
    expect(handyUtils.isDeepEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(handyUtils.deepClone({ a: 1 })).toEqual({ a: 1 });
  });
});

describe("NodeEnum", () => {
  test("should map to Object.prototype.toString tags", () => {
    expect(NodeEnum.OBJECT).toBe(Object.prototype.toString.call({}));
    expect(NodeEnum.ARRAY).toBe(Object.prototype.toString.call([]));
    expect(NodeEnum.STRING).toBe(Object.prototype.toString.call(""));
    expect(NodeEnum.NUMBER).toBe(Object.prototype.toString.call(1));
    expect(NodeEnum.BOOLEAN).toBe(Object.prototype.toString.call(true));
    expect(NodeEnum.FUNCTION).toBe(Object.prototype.toString.call(function () {}));
    expect(NodeEnum.UNDEFINED).toBe(Object.prototype.toString.call(undefined));
    expect(NodeEnum.NULL).toBe(Object.prototype.toString.call(null));
    expect(NodeEnum.DATE).toBe(Object.prototype.toString.call(new Date()));
  });
});
