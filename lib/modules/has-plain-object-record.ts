import isPlainObject from "./is-plain-object";

/** Whether a plain object carries any own enumerable entry. */
const hasPlainObjectRecord = (val: unknown): boolean => {
  if (!isPlainObject(val))
    throw new Error(
      "hasPlainObjectRecord should only use for plain object type."
    );

  if (Object.keys(val).length > 0) return true;

  // `Object.keys` skips symbol keys, so an object whose only entries were symbols was reported as
  // empty.
  return Object.getOwnPropertySymbols(val).some((symbol) =>
    Object.prototype.propertyIsEnumerable.call(val, symbol)
  );
};

export default hasPlainObjectRecord;
