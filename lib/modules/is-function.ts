/**
 * `typeof` is the only reliable function test: it covers arrow, async,
 * generator and async-generator functions as well as class constructors,
 * all of which report distinct `Object.prototype.toString` tags
 * ("[object AsyncFunction]", "[object GeneratorFunction]", ...).
 */
const isFunction = (val: unknown): val is Function => {
  return typeof val === "function";
};

export default isFunction;
