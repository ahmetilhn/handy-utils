import isObject from "./is-object";

const getTag = (val: unknown): string => Object.prototype.toString.call(val);

type TypedArrayConstructor = new (
  buffer: ArrayBufferLike,
  byteOffset: number,
  length: number
) => ArrayBufferView;

const copyOwnKeys = (
  source: object,
  target: Record<string | symbol, unknown>,
  seen: WeakMap<object, unknown>
): void => {
  const keys: Array<string | symbol> = Object.keys(source);
  const symbols = Object.getOwnPropertySymbols(source);
  for (let i = 0; i < symbols.length; i++) {
    if (Object.prototype.propertyIsEnumerable.call(source, symbols[i])) {
      keys.push(symbols[i]);
    }
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    target[key] = clone(
      (source as Record<string | symbol, unknown>)[key],
      seen
    );
  }
};

const clone = <T>(val: T, seen: WeakMap<object, unknown>): T => {
  // Primitives are immutable, and functions are shared by reference on purpose: copying one would
  // break identity comparisons and closure state.
  if (!isObject(val) || typeof val === "function") return val;

  const source = val as unknown as object;

  // Preserves cycles and keeps shared references shared within one clone.
  if (seen.has(source)) return seen.get(source) as T;

  const tag = getTag(source);

  switch (tag) {
    case "[object Date]": {
      const copy = new Date((source as Date).getTime());
      seen.set(source, copy);
      return copy as unknown as T;
    }

    case "[object RegExp]": {
      const regExp = source as RegExp;
      const copy = new RegExp(regExp.source, regExp.flags);
      copy.lastIndex = regExp.lastIndex;
      seen.set(source, copy);
      return copy as unknown as T;
    }

    case "[object Map]": {
      const copy = new Map();
      seen.set(source, copy);
      for (const [key, value] of source as Map<unknown, unknown>) {
        copy.set(clone(key, seen), clone(value, seen));
      }
      return copy as unknown as T;
    }

    case "[object Set]": {
      const copy = new Set();
      seen.set(source, copy);
      for (const value of source as Set<unknown>) {
        copy.add(clone(value, seen));
      }
      return copy as unknown as T;
    }

    case "[object ArrayBuffer]": {
      const copy = (source as ArrayBuffer).slice(0);
      seen.set(source, copy);
      return copy as unknown as T;
    }

    case "[object DataView]": {
      const view = source as DataView;
      const copy = new DataView(
        view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength)
      );
      seen.set(source, copy);
      return copy as unknown as T;
    }

    case "[object Error]": {
      const error = source as Error;
      const ErrorCtor = error.constructor as ErrorConstructor;
      const copy = new ErrorCtor(error.message);
      seen.set(source, copy);
      copy.name = error.name;
      copy.stack = error.stack;
      if ("cause" in error) {
        (copy as Error & { cause?: unknown }).cause = clone(
          (error as Error & { cause?: unknown }).cause,
          seen
        );
      }
      copyOwnKeys(error, copy as unknown as Record<string | symbol, unknown>, seen);
      return copy as unknown as T;
    }

    // Not structurally inspectable — sharing the reference is the only option that keeps the clone
    // usable.
    case "[object WeakMap]":
    case "[object WeakSet]":
    case "[object Promise]":
      return val;
  }

  if (ArrayBuffer.isView(source)) {
    const view = source as ArrayBufferView;
    const TypedArray = view.constructor as TypedArrayConstructor;
    const copy = new TypedArray(
      view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength),
      0,
      (view as unknown as { length: number }).length
    );
    seen.set(source, copy);
    return copy as unknown as T;
  }

  if (Array.isArray(source)) {
    // `new Array(length)` + an `in` check preserves both length and holes, which `forEach`/`push`
    // would silently compact away.
    const copy = new Array(source.length);
    seen.set(source, copy);
    for (let i = 0; i < source.length; i++) {
      if (i in source) copy[i] = clone(source[i], seen);
    }
    copyOwnKeysExceptIndices(source, copy, seen);
    return copy as unknown as T;
  }

  // Plain objects and class instances: keep the prototype so instances stay instances, and
  // `Object.create(null)` objects stay prototype-less.
  const copy = Object.create(Object.getPrototypeOf(source)) as Record<
    string | symbol,
    unknown
  >;
  seen.set(source, copy);
  copyOwnKeys(source, copy, seen);
  return copy as unknown as T;
};

const copyOwnKeysExceptIndices = (
  source: unknown[],
  target: unknown[],
  seen: WeakMap<object, unknown>
): void => {
  const keys = Object.keys(source);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // Array index keys were already handled by the positional copy above.
    if (String(Number(key)) === key) continue;
    (target as unknown as Record<string, unknown>)[key] = clone(
      (source as unknown as Record<string, unknown>)[key],
      seen
    );
  }
};

/**
 * Recursive structural clone. Safe against circular and shared references, preserves prototypes,
 * and understands Date, RegExp, Map, Set, Error…
 */
const deepClone = <T>(val: T): T => clone(val, new WeakMap<object, unknown>());

export default deepClone;
