import { hasPlainObjectRecord, isArray, isDate, isFunction } from "..";
import isPlainObject from "./is-plain-object";

const isDeepEqual = (valOne: unknown, valTwo: unknown): boolean => {
  if (valOne === valTwo) return true;
  if (typeof valOne !== typeof valTwo || valOne === null || valTwo === null)
    return false;
  if (
    isPlainObject(valOne) &&
    isPlainObject(valTwo) &&
    !hasPlainObjectRecord(valOne) &&
    !hasPlainObjectRecord(valTwo)
  )
    return true;
  if (isDate(valOne) && isDate(valTwo)) {
    return isDeepEqual(valOne.getTime(), valTwo.getTime());
  } else if (isArray(valOne) && isArray(valTwo)) {
    if (!valOne.length && !valTwo.length) return true;
    else if (valOne.length !== valTwo.length) return false;
    let index = 0;
    while (index < valOne.length) {
      if (!isDeepEqual(valOne[index], valTwo[index])) return false;
      index++;
    }
    return true;
  } else if (isPlainObject(valOne) && isPlainObject(valTwo)) {
    if (Object.keys(valOne).length !== Object.keys(valTwo).length) return false;
    for (const key in valOne) {
      if (!Object.prototype.hasOwnProperty.call(valTwo, key)) return false;
      if (!isDeepEqual(valOne[key], valTwo[key])) return false;
    }
    return true;
  } else if (isFunction(valOne) && isFunction(valTwo)) {
    return isDeepEqual(valOne.toString(), valTwo.toString());
  }

  return valOne === valTwo;
};

export default isDeepEqual;
