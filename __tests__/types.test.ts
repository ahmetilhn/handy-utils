import isDefined from "@/modules/is-defined";
import isArray from "@/modules/is-array";
import isPlainObject from "@/modules/is-plain-object";
import isFunction from "@/modules/is-function";
import isNumber from "@/modules/is-number";
import sleep from "@/modules/sleep";
import deepClone from "@/modules/deep-clone";

/**
 * These assertions are enforced by `npm run typecheck`; the runtime
 * expectations below only keep jest from reporting an empty suite.
 */
describe("type surface", () => {
  test("isDefined should narrow away null and undefined", () => {
    const maybe = "value" as string | null | undefined;

    if (isDefined(maybe)) {
      // Previously declared `val is Exclude<any, undefined | null>`, which
      // collapses to `any` and narrowed nothing.
      const narrowed: string = maybe;
      expect(narrowed).toBe("value");
    } else {
      throw new Error("expected the value to be defined");
    }
  });

  test("isDefined should narrow inside a filter", () => {
    const values: Array<number | null> = [1, null, 2];
    const defined: number[] = values.filter(isDefined);

    expect(defined).toEqual([1, 2]);
  });

  test("sleep should resolve to void", async () => {
    const pending: Promise<void> = sleep(1);
    const resolved: void = await pending;

    expect(resolved).toBeUndefined();
  });

  test("guards should narrow unknown values", () => {
    const unknownValue: unknown = [1, 2, 3];

    if (isArray(unknownValue)) {
      const length: number = unknownValue.length;
      expect(length).toBe(3);
    }

    const record: unknown = { a: 1 };
    if (isPlainObject(record)) {
      const value: unknown = record.a;
      expect(value).toBe(1);
    }

    const callable: unknown = () => 7;
    if (isFunction(callable)) {
      expect(callable()).toBe(7);
    }

    const numeric: unknown = 5;
    if (isNumber(numeric)) {
      const doubled: number = numeric * 2;
      expect(doubled).toBe(10);
    }
  });

  test("deepClone should preserve the input type", () => {
    const source = { list: [1, 2], when: new Date(0) };
    const copy: { list: number[]; when: Date } = deepClone(source);

    expect(copy.list).toEqual([1, 2]);
    expect(copy.when).toBeInstanceOf(Date);
  });
});
