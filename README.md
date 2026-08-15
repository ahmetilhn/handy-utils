# handy-utils

Handy utils offers developers a powerful and easy-to-use toolset. With its clean, modular and scalable code structure, it accelerates development processes and reduces code complexity. With a wide range of functions, it offers ready-made methods for solving common problems.

<p align="center">
  <a href="https://www.npmjs.com/package/@ahmetilhn/handy-utils"><img alt="NPM" src="https://img.shields.io/npm/v/@ahmetilhn/handy-utils.svg" /></a>
  <a href="https://img.shields.io/npm/dy/@ahmetilhn/handy-utils"><img alt="NPM" src="https://img.shields.io/npm/dy/@ahmetilhn/handy-utils" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
</p>
## Breaking changes in 4.0.0

`isDeepEqual`, `deepClone`, `isPlainObject` and `isFunction` returned wrong
answers for several common inputs. Fixing them changes observable behaviour.

| Case                                            | 3.x                             | 4.0.0                       |
| ----------------------------------------------- | ------------------------------- | --------------------------- |
| `isPlainObject(new Map())`, `new URL()`, class instances | `true`                 | `false` — only literals and `Object.create(null)` are plain |
| `isDeepEqual` on two `Map`/`Set`/`RegExp`/`Error`/`URL` values | `true` regardless of content | Compared by value |
| `isDeepEqual(NaN, NaN)`                          | `false`                         | `true`                      |
| `isDeepEqual(0, -0)`                             | `true`                          | `false`                     |
| `isDeepEqual` on two functions with equal source | `true` (compared `toString()`)  | `false` — only the same reference is equal |
| `isDeepEqual` on circular input                  | `RangeError`                    | Handled                     |
| `deepClone(new Map())`, `RegExp`, class instance | `{}` — type and prototype lost  | Correct type and prototype  |
| `deepClone` on circular input                    | `RangeError`                    | Handled                     |
| `deepClone([, 1, , 2])`                          | `[1, 2]` — holes compacted      | Length and holes preserved  |
| `isFunction(async () => {})`, generators         | `false`                         | `true`                      |

`isDeepEqual` and `deepClone` also gained support for typed arrays,
`ArrayBuffer`, `DataView`, boxed primitives and enumerable symbol keys.

The old function comparison is the change most likely to affect callers: two
functions with identical source can capture different closure state, so they are
not interchangeable. Compare functions by reference, as lodash and Node's
`assert.deepStrictEqual` do.

## Requirements

Node.js **24 or newer**.

## Installation

###### NPM

```bash
npm install @ahmetilhn/handy-utils
```

###### YARN

```bash
yarn add @ahmetilhn/handy-utils
```

## Awesome Utils

### deepClone

Recursive structural clone that disconnects every data binding. Safe against
circular and shared references, and preserves prototypes.

###### Function Signature

```ts
deepClone<T>(val: T): T
```

###### Examples

```ts
const clonedVal = deepClone({ name: "test" });
clonedVal !== original; // a new reference
isDeepEqual(clonedVal, original); // structurally identical

// Built-ins keep their type
deepClone(new Map([["a", 1]])) instanceof Map; // true
deepClone(/foo/g) instanceof RegExp; // true
deepClone(new Date()) instanceof Date; // true
deepClone(new Uint8Array([1, 2])) instanceof Uint8Array; // true

// Class instances keep their prototype
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `hi ${this.name}`;
  }
}
deepClone(new Person("Ada")).greet(); // "hi Ada"

// Sparse arrays keep their shape
deepClone([, 1, , 2]).length; // 4

// Circular and shared references are preserved, not followed forever
const node = { name: "root" };
node.self = node;
deepClone(node).self === deepClone(node); // the copy points at itself
```

Functions, `WeakMap`, `WeakSet` and `Promise` are shared by reference, because
copying them is not meaningful.

### sleep

Wait for the execution process as long as you want

###### Function Signature

```ts
sleep(time: number): Promise<void>
```

### isServer

###### Function Signature

```ts
// it should return true on node runtime
isServer(); // true
```

### isClient

###### Function Signature

```ts
// it should return true on browser
isClient(); // true
```

###### Examples

```ts
const jobEverySecond = async () => {
  // Codes
  await sleep(1000); // sleep for 1 second
};
```

## Compare

### isDeepEqual

Structural equality with `Object.is` semantics for primitives. Safe against
circular references.

###### Function Signature

```ts
isDeepEqual(valOne: unknown, valTwo: unknown): boolean
```

###### Examples

```ts
isDeepEqual(10, 10); // true
isDeepEqual("test", 1); // false
isDeepEqual(null, 1); // false
isDeepEqual(null, NaN); // false

// Object.is semantics
isDeepEqual(NaN, NaN); // true
isDeepEqual(0, -0); // false

// Structural comparison
isDeepEqual({ name: "john" }, { name: "john" }); // true
isDeepEqual(["john"], ["john"]); // true
isDeepEqual([{ key: "value" }], [{ key: "value" }]); // true
isDeepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true — key order is irrelevant

// Built-ins compare by value
isDeepEqual(new Date(5), new Date(5)); // true
isDeepEqual(new Map([["a", 1]]), new Map([["a", 1]])); // true
isDeepEqual(new Set([1, 2]), new Set([2, 1])); // true — order is irrelevant
isDeepEqual(/foo/g, /foo/i); // false — flags differ
isDeepEqual(new URL("https://a.com"), new URL("https://b.com")); // false
isDeepEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])); // true

// Class instances need a matching prototype
class Point {
  constructor(x) {
    this.x = x;
  }
}
isDeepEqual(new Point(1), new Point(1)); // true
isDeepEqual(new Point(1), { x: 1 }); // false

// Functions are equal only by reference: identical source can still capture
// different closure state.
const fn = () => 10;
isDeepEqual(fn, fn); // true
isDeepEqual(() => 10, () => 10); // false

// Circular input is handled
const a = { name: "a" };
a.self = a;
const b = { name: "a" };
b.self = b;
isDeepEqual(a, b); // true
```

## Type Check

### isObject

Check if val is an object

###### Function Signature

```ts
isObject(val: any): boolean
```

###### Examples

```ts
isObject([]); // true
isObject(null); // false
isObject(undefined); // false
isObject(NaN); // false
isObject({}); //
isObject(new Date()); // true
```

### isDate

Check if val is an date

###### Function Signature

```ts
isDate(val: any): boolean
```

###### Examples

```ts
isDate(Date); // false
isDate(null); // false
isDate("12-22-2023"); // false
isDate(new Date()); // true
```

### isBoolean

Check if val is true or false (boolean)

###### Function Signature

```ts
isBoolean(val: any): boolean
```

###### Examples

```ts
isBoolean(null); // false
isBoolean(false); // true
isBoolean(true); // true
isBoolean(Boolean); // false
isBoolean(0); // false
```

### isArray

Check if val is an array

###### Function Signature

```ts
isArray(val: any): boolean
```

###### Examples

```ts
isArray(null); // false
isArray({}); // false
isArray([]); // true
isArray(new Array([])); // true
```

### isNumber

Check if val is an number

###### Function Signature

```ts
isNumber(val: any): boolean
```

###### Examples

```ts
isNumber(null); // false
isNumber(NaN); // true
isNumber(1); // true
isNumber("1"); // false
```

### isFunction

Check if val is callable. Covers every function form, including async,
generator and class constructors.

###### Function Signature

```ts
isFunction(val: unknown): val is Function
```

###### Examples

```ts
isFunction(NaN); // false
isFunction(() => {}); // true
isFunction(async () => {}); // true
isFunction(function* () {}); // true
isFunction(class Foo {}); // true
```

### isPlainObject

Check if val is a plain object — created by an object literal, `new Object()` or
`Object.create(null)`. Built-ins and class instances are objects but not plain:
their state lives in internal slots rather than own enumerable keys.

###### Function Signature

```ts
isPlainObject(val: unknown): val is Record<string, unknown>
```

###### Examples

```ts
isPlainObject({}); // true
isPlainObject({ name: "john" }); // true
isPlainObject(Object.create(null)); // true

isPlainObject([]); // false
isPlainObject(new Date()); // false
isPlainObject(new Map()); // false
isPlainObject(new URL("https://a.com")); // false
isPlainObject(new (class Point {})()); // false
isPlainObject(null); // false
```

### isUndefined

Check if val isn't defined

###### Function Signature

```ts
isUndefined(val: any): boolean
```

###### Examples

```ts
const user = {
  name: "John",
};
isUndefined(user.name); // false
isUndefined(user.lastName); // true
```

### isDefined

Check if val is defined

###### Function Signature

```ts
isDefined(val: any): boolean
```

###### Examples

```ts
const user = {
  name: "John",
};
isDefined(user.name); // true
isDefined(user.lastName); // false
```

## Test Coverage

211 tests, enforced at 100% for statements, branches, functions and lines.

```bash
npm run verify   # typecheck, test with coverage, build
```

_created by Ahmet ilhan_

## Releasing

Releases are automatic. Bump `version` in `package.json` and merge to `master`:

```bash
npm version patch   # or minor / major
git push origin master
```

The publish workflow then type-checks, tests, builds, smoke-tests the packed
tarball in a clean project, publishes to npm with provenance, and pushes a
`v<version>` tag.

A commit that does not change the version is not an error — the workflow sees
the version already on npm and skips the release.
