import isNull from "./is-null";
import isUndefined from "./is-undefined";

const isDefined = (val: unknown): val is Exclude<any, undefined | null> => {
  return !isUndefined(val) && !isNull(val);
};

export default isDefined;
