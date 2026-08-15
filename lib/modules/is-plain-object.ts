import isObject from "./is-object";

/**
 * A plain object is one created by an object literal, `new Object()` or
 * `Object.create(null)` — i.e. its prototype is `Object.prototype` or `null`.
 *
 * Built-ins such as `Map`, `Set`, `RegExp`, `Error`, `URL` and class instances
 * are objects, but they are NOT plain: their data lives in internal slots or
 * behind prototype accessors rather than in own enumerable keys, so treating
 * them as plain leads callers to compare or clone them incorrectly.
 */
const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  if (!isObject(val)) return false;

  const proto = Object.getPrototypeOf(val);
  if (proto === null) return true;

  // Walk to the realm's root prototype so that objects originating from another
  // realm (iframe, vm context, worker) are still recognised as plain.
  let root = proto;
  while (Object.getPrototypeOf(root) !== null) {
    root = Object.getPrototypeOf(root);
  }

  return proto === root;
};

export default isPlainObject;
