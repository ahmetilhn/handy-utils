/**
 * The `[object X]` tag of a value. `Object.prototype.toString` already reports
 * "[object Null]" for null, so no special case is needed.
 */
const getNode = (node: unknown): string => {
  return Object.prototype.toString.call(node);
};

export default getNode;
