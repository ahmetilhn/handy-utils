import isObject from "./is-object";
import isPlainObject from "./is-plain-object";

const getTag = (val: unknown): string => Object.prototype.toString.call(val);

const ownKeys = (val: object): Array<string | symbol> => {
  const keys: Array<string | symbol> = Object.keys(val);
  const symbols = Object.getOwnPropertySymbols(val);
  for (let i = 0; i < symbols.length; i++) {
    if (Object.prototype.propertyIsEnumerable.call(val, symbols[i])) {
      keys.push(symbols[i]);
    }
  }
  return keys;
};

const equalBytes = (a: ArrayBufferLike, b: ArrayBufferLike): boolean => {
  if (a.byteLength !== b.byteLength) return false;
  const viewA = new Uint8Array(a);
  const viewB = new Uint8Array(b);
  for (let i = 0; i < viewA.length; i++) {
    if (viewA[i] !== viewB[i]) return false;
  }
  return true;
};

const equalMaps = (
  a: Map<unknown, unknown>,
  b: Map<unknown, unknown>,
  seen: Map<object, Set<object>>
): boolean => {
  if (a.size !== b.size) return false;

  const unmatched: Array<[unknown, unknown]> = [];

  for (const [key, value] of a) {
    // Fast path: identity-comparable keys resolve through the native lookup.
    if (b.has(key)) {
      if (!equals(value, b.get(key), seen)) return false;
    } else if (isObject(key)) {
      unmatched.push([key, value]);
    } else {
      return false;
    }
  }

  if (!unmatched.length) return true;

  // Slow path: object keys need structural matching, and each entry in `b` may
  // only be consumed once.
  const candidates = new Set<unknown>();
  for (const key of b.keys()) {
    if (isObject(key) && !a.has(key)) candidates.add(key);
  }

  for (const [key, value] of unmatched) {
    let matched = false;
    for (const candidate of candidates) {
      if (equals(key, candidate, seen) && equals(value, b.get(candidate), seen)) {
        candidates.delete(candidate);
        matched = true;
        break;
      }
    }
    if (!matched) return false;
  }

  return true;
};

const equalSets = (
  a: Set<unknown>,
  b: Set<unknown>,
  seen: Map<object, Set<object>>
): boolean => {
  if (a.size !== b.size) return false;

  const unmatched: unknown[] = [];

  for (const value of a) {
    if (b.has(value)) continue;
    if (isObject(value)) unmatched.push(value);
    else return false;
  }

  if (!unmatched.length) return true;

  const candidates = new Set<unknown>();
  for (const value of b.values()) {
    if (isObject(value) && !a.has(value)) candidates.add(value);
  }

  for (const value of unmatched) {
    let matched = false;
    for (const candidate of candidates) {
      if (equals(value, candidate, seen)) {
        candidates.delete(candidate);
        matched = true;
        break;
      }
    }
    if (!matched) return false;
  }

  return true;
};

const equals = (
  valOne: unknown,
  valTwo: unknown,
  seen: Map<object, Set<object>>
): boolean => {
  // `Object.is` gives us NaN === NaN and keeps 0 distinct from -0.
  if (Object.is(valOne, valTwo)) return true;

  // Anything not identical and not an object (including functions, which are
  // only ever equal by reference) cannot be deeply equal.
  if (!isObject(valOne) || !isObject(valTwo)) return false;

  const tag = getTag(valOne);
  if (tag !== getTag(valTwo)) return false;

  // Cycle guard: if we are already comparing this exact pair further up the
  // stack, assume equality and let the rest of the structure decide.
  let partners = seen.get(valOne);
  if (partners) {
    if (partners.has(valTwo)) return true;
  } else {
    partners = new Set<object>();
    seen.set(valOne, partners);
  }
  partners.add(valTwo);

  switch (tag) {
    case "[object Date]":
      return Object.is((valOne as Date).getTime(), (valTwo as Date).getTime());

    case "[object RegExp]":
      return (
        (valOne as RegExp).source === (valTwo as RegExp).source &&
        (valOne as RegExp).flags === (valTwo as RegExp).flags
      );

    case "[object Number]":
    case "[object String]":
    case "[object Boolean]":
    case "[object Symbol]":
    case "[object BigInt]":
      return Object.is(
        (valOne as { valueOf(): unknown }).valueOf(),
        (valTwo as { valueOf(): unknown }).valueOf()
      );

    case "[object Error]":
      return (
        (valOne as Error).name === (valTwo as Error).name &&
        (valOne as Error).message === (valTwo as Error).message
      );

    // Serialise to their canonical string form — both are common enough in
    // application code to be worth comparing by value rather than reference.
    case "[object URL]":
    case "[object URLSearchParams]":
      return String(valOne) === String(valTwo);

    case "[object Map]":
      return equalMaps(
        valOne as Map<unknown, unknown>,
        valTwo as Map<unknown, unknown>,
        seen
      );

    case "[object Set]":
      return equalSets(valOne as Set<unknown>, valTwo as Set<unknown>, seen);

    case "[object ArrayBuffer]":
      return equalBytes(valOne as ArrayBuffer, valTwo as ArrayBuffer);

    case "[object DataView]":
      return equalBytes(
        (valOne as DataView).buffer.slice(
          (valOne as DataView).byteOffset,
          (valOne as DataView).byteOffset + (valOne as DataView).byteLength
        ),
        (valTwo as DataView).buffer.slice(
          (valTwo as DataView).byteOffset,
          (valTwo as DataView).byteOffset + (valTwo as DataView).byteLength
        )
      );

    // WeakMap/WeakSet/Promise expose no inspectable contents — reference
    // equality is the only sound answer, and `Object.is` already ruled it out.
    case "[object WeakMap]":
    case "[object WeakSet]":
    case "[object Promise]":
      return false;
  }

  if (ArrayBuffer.isView(valOne) && ArrayBuffer.isView(valTwo)) {
    const a = valOne as Uint8Array;
    const b = valTwo as Uint8Array;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(valOne) && Array.isArray(valTwo)) {
    if (valOne.length !== valTwo.length) return false;
    for (let i = 0; i < valOne.length; i++) {
      if (!equals(valOne[i], valTwo[i], seen)) return false;
    }
    return true;
  }

  // Everything reaching this point is compared through its own enumerable
  // properties. Exotic built-ins and host objects (DOM nodes, Headers, Blob,
  // FormData, ...) keep their state in internal slots, so they expose nothing
  // to compare — claiming equality there is exactly the bug this guard exists
  // to prevent. Reference equality was already ruled out by `Object.is`.
  if (tag !== "[object Object]" && tag !== "[object Arguments]") return false;

  // Class instances only compare against instances sharing their prototype.
  // Plain objects skip that check so cross-realm literals still match.
  if (!isPlainObject(valOne) || !isPlainObject(valTwo)) {
    if (Object.getPrototypeOf(valOne) !== Object.getPrototypeOf(valTwo)) {
      return false;
    }
  }

  const keysOne = ownKeys(valOne);
  const keysTwo = ownKeys(valTwo);
  if (keysOne.length !== keysTwo.length) return false;

  for (let i = 0; i < keysOne.length; i++) {
    const key = keysOne[i];
    if (!Object.prototype.hasOwnProperty.call(valTwo, key)) return false;
    if (
      !equals(
        (valOne as Record<string | symbol, unknown>)[key],
        (valTwo as Record<string | symbol, unknown>)[key],
        seen
      )
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Structural equality with `Object.is` semantics for primitives.
 *
 * Handles Date, RegExp, Map, Set, Error, boxed primitives, ArrayBuffer,
 * DataView and typed arrays, is safe against circular references, and treats
 * functions as equal only when they are the same reference.
 */
const isDeepEqual = (valOne: unknown, valTwo: unknown): boolean => {
  return equals(valOne, valTwo, new Map<object, Set<object>>());
};

export default isDeepEqual;
