import isNull from "./is-null";
import isUndefined from "./is-undefined";

/**
 * Generic on purpose: the previous signature declared `val is Exclude<any,
 * undefined | null>`, and `Exclude<any, T>` collapses back to `any`, so the
 * predicate narrowed nothing. `NonNullable<T>` actually strips the union.
 */
const isDefined = <T>(val: T): val is NonNullable<T> => {
  return !isUndefined(val) && !isNull(val);
};

export default isDefined;
