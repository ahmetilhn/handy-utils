# handy-utils

<p align="center">
  <a href="https://www.npmjs.com/package/@ahmetilhn/handy-utils"><img alt="npm version" src="https://img.shields.io/npm/v/@ahmetilhn/handy-utils.svg" /></a>
  <a href="https://www.npmjs.com/package/@ahmetilhn/handy-utils"><img alt="npm downloads" src="https://img.shields.io/npm/dy/@ahmetilhn/handy-utils" /></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
</p>

A small, dependency-free toolkit of the checks and helpers most projects end up
rewriting: type guards that actually narrow, a structural equality function that
does not lie about `Map`s and `URL`s, a clone that survives circular references,
and a handful of everyday utilities.

- **21 functions, zero dependencies.**
- **Written in TypeScript.** Every guard is a real type predicate.
- **Correct on hard inputs.** Circular references, `NaN`, `-0`, `Map`, `Set`,
  `Date`, `RegExp`, typed arrays and class instances are all handled.
- **Isomorphic.** Nothing touches `window` unless you call a browser helper.
- **100% test coverage**, enforced in CI across 239 tests.

---

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API reference](#api-reference)
  - [Comparison and cloning](#comparison-and-cloning) — `isDeepEqual`, `deepClone`
  - [Type guards](#type-guards) — `isArray`, `isBoolean`, `isDate`, `isDefined`, `isFunction`, `isNull`, `isNumber`, `isObject`, `isPlainObject`, `isUndefined`, `hasPlainObjectRecord`
  - [Environment](#environment) — `isClient`, `isServer`
  - [Device](#device) — `isAndroid`, `isIos`
  - [Utilities](#utilities) — `normalize`, `sleep`, `watcher`, `withRetry`
- [How values are compared](#how-values-are-compared)
- [TypeScript](#typescript)
- [Breaking changes in 4.0.0](#breaking-changes-in-400)
- [Contributing](#contributing)
- [Releasing](#releasing)
- [License](#license)

---

## Requirements

Node.js **24 or newer**. In the browser, any engine supporting ES2022 — every
evergreen release since 2022.

## Installation

```bash
npm install @ahmetilhn/handy-utils
```

```bash
yarn add @ahmetilhn/handy-utils
```

## Quick start

Everything is a named export, so bundlers drop what you do not use.

```ts
import { isDeepEqual, deepClone, isDefined, sleep } from "@ahmetilhn/handy-utils";

isDeepEqual({ a: [1, 2] }, { a: [1, 2] }); // true
deepClone(new Map([["k", { n: 1 }]])); // a real Map, deeply copied

const values = [1, null, 2];
const defined = values.filter(isDefined); // number[] — narrowed

await sleep(200);
```

CommonJS works the same way:

```js
const { isDeepEqual } = require("@ahmetilhn/handy-utils");
```

---

## API reference

### Comparison and cloning

#### `isDeepEqual`

Structural equality with `Object.is` semantics for primitives. Safe against
circular references.

```ts
isDeepEqual(valOne: unknown, valTwo: unknown): boolean
```

```ts
// Primitives use Object.is: NaN matches itself, 0 and -0 stay distinct
isDeepEqual(10, 10); // true
isDeepEqual(NaN, NaN); // true
isDeepEqual(0, -0); // false
isDeepEqual(1, "1"); // false
isDeepEqual(null, undefined); // false

// Objects and arrays compare by content; key order is irrelevant
isDeepEqual({ name: "john" }, { name: "john" }); // true
isDeepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true
isDeepEqual({ a: 1 }, { a: 1, b: 2 }); // false
isDeepEqual([1, [2]], [1, [2]]); // true
isDeepEqual([1, 2], [2, 1]); // false — order matters in arrays

// Built-ins compare by value
isDeepEqual(new Date(5), new Date(5)); // true
isDeepEqual(/foo/g, /foo/i); // false — flags differ
isDeepEqual(new Map([["a", 1]]), new Map([["a", 1]])); // true
isDeepEqual(new Set([1, 2]), new Set([2, 1])); // true — order irrelevant
isDeepEqual(new Error("boom"), new Error("boom")); // true
isDeepEqual(new URL("https://a.com"), new URL("https://b.com")); // false
isDeepEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])); // true

// Class instances need a matching prototype as well as matching fields
class Point {
  constructor(public x: number) {}
}
isDeepEqual(new Point(1), new Point(1)); // true
isDeepEqual(new Point(1), { x: 1 }); // false

// Functions are equal only by reference
const fn = () => 10;
isDeepEqual(fn, fn); // true
isDeepEqual(() => 10, () => 10); // false

// Circular input is handled
const a: any = { name: "a" };
a.self = a;
const b: any = { name: "a" };
b.self = b;
isDeepEqual(a, b); // true
```

**Why functions compare by reference.** Two functions with identical source can
capture different closure state, so they are not interchangeable:

```ts
const make = (k: number) => (x: number) => x + k;
make(1)(0); // 1
make(99)(0); // 99
// Identical source, different behaviour — comparing toString() would call
// these equal. lodash and Node's assert.deepStrictEqual agree: not equal.
```

**Values with no observable structure** — `WeakMap`, `WeakSet`, `Promise`,
generators, DOM nodes — can only be compared by reference. See
[How values are compared](#how-values-are-compared) for the full table.

---

#### `deepClone`

Recursive structural clone that disconnects every data binding. Safe against
circular and shared references, and preserves prototypes.

```ts
deepClone<T>(val: T): T
```

```ts
const original = { name: "test", tags: ["a"] };
const copy = deepClone(original);

copy !== original; // a new reference
copy.tags !== original.tags; // nested values copied too
isDeepEqual(copy, original); // structurally identical

// Built-ins keep their type
deepClone(new Map([["a", 1]])) instanceof Map; // true
deepClone(new Set([1])) instanceof Set; // true
deepClone(/foo/g) instanceof RegExp; // true — source, flags and lastIndex kept
deepClone(new Date()) instanceof Date; // true
deepClone(new Uint8Array([1, 2])) instanceof Uint8Array; // true
deepClone(new Error("boom")) instanceof Error; // true — name, stack, cause kept

// Class instances keep their prototype and therefore their methods
class Person {
  constructor(public name: string) {}
  greet() {
    return `hi ${this.name}`;
  }
}
deepClone(new Person("Ada")).greet(); // "hi Ada"

// Object.create(null) stays prototype-less
Object.getPrototypeOf(deepClone(Object.create(null))); // null

// Sparse arrays keep their length and their holes
deepClone([, 1, , 2]).length; // 4

// Enumerable symbol keys are copied
const id = Symbol("id");
deepClone({ [id]: 1 })[id]; // 1
```

**Circular and shared references:**

```ts
const node: any = { name: "root" };
node.self = node;
const copy = deepClone(node);
copy.self === copy; // true — the cycle is rebuilt, not followed forever

// Sharing is preserved within one clone
const shared = { n: 1 };
const cloned = deepClone({ a: shared, b: shared });
cloned.a === cloned.b; // true
```

**Shared by reference on purpose:** functions, `WeakMap`, `WeakSet` and
`Promise`. Copying them is not meaningful — a cloned function would break
identity comparisons, and a weak collection's contents are not enumerable.

---

### Type guards

Every guard below is a TypeScript type predicate, so it narrows inside `if`
blocks and works as a `.filter()` argument.

#### `isDefined`

Neither `null` nor `undefined`. Narrows to `NonNullable<T>`.

```ts
isDefined<T>(val: T): val is NonNullable<T>
```

```ts
isDefined("value"); // true
isDefined(0); // true — falsy, but defined
isDefined(""); // true
isDefined(false); // true
isDefined(null); // false
isDefined(undefined); // false

// Narrowing
declare const maybe: string | null | undefined;
if (isDefined(maybe)) {
  maybe.toUpperCase(); // string
}

// As a filter predicate
const values: Array<number | null> = [1, null, 2];
const defined: number[] = values.filter(isDefined); // [1, 2]
```

#### `isNull`

```ts
isNull(val: unknown): val is null
```

```ts
isNull(null); // true
isNull(undefined); // false
isNull(0); // false
```

#### `isUndefined`

```ts
isUndefined(val: unknown): val is undefined
```

```ts
isUndefined(undefined); // true
isUndefined(null); // false
```

#### `isNumber`

A **finite** number. `NaN` and `Infinity` are numbers by `typeof` but not values
you can compute with, so both are rejected.

```ts
isNumber(val: unknown): val is number
```

```ts
isNumber(1); // true
isNumber(-5.5); // true
isNumber(0); // true

isNumber(NaN); // false
isNumber(Infinity); // false
isNumber("1"); // false
isNumber(null); // false
isNumber(new Number(1)); // false — boxed, typeof is "object"
```

#### `isBoolean`

```ts
isBoolean(val: unknown): val is boolean
```

```ts
isBoolean(true); // true
isBoolean(false); // true
isBoolean(0); // false
isBoolean(new Boolean(true)); // false — boxed, not a primitive
```

#### `isArray`

```ts
isArray(val: unknown): val is Array<any>
```

```ts
isArray([]); // true
isArray([1, 2]); // true
isArray("ab"); // false
isArray(new Uint8Array()); // false — a typed array is not an Array
isArray({ length: 0 }); // false
```

#### `isObject`

Any non-null value of `typeof "object"`. Arrays and dates count; functions do
not. For "is this a `{}`-style object", use [`isPlainObject`](#isplainobject).

```ts
isObject(val: unknown): val is object
```

```ts
isObject({}); // true
isObject([]); // true
isObject(new Date()); // true
isObject(null); // false
isObject(() => {}); // false
```

#### `isPlainObject`

An object created by an object literal, `new Object()` or `Object.create(null)`
— its prototype is `Object.prototype` or `null`. Built-ins and class instances
are objects but not plain: their state lives in internal slots or behind
prototype accessors, not in own enumerable keys.

```ts
isPlainObject(val: unknown): val is Record<string, unknown>
```

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

Cross-realm objects (from an iframe or a `vm` context) are recognised too.

#### `isDate`

A `Date` instance. Note this is a type check, not a validity check — an invalid
date is still a `Date`.

```ts
isDate(val: unknown): val is Date
```

```ts
isDate(new Date()); // true
isDate(new Date("nope")); // true — still a Date object
isDate(Date.now()); // false — that is a number
isDate("2023-01-01"); // false
```

To also require validity: `isDate(v) && !Number.isNaN(v.getTime())`.

#### `isFunction`

Any callable, including arrow, async, generator and async-generator functions,
and class constructors.

```ts
isFunction(val: unknown): val is Function
```

```ts
isFunction(() => {}); // true
isFunction(async () => {}); // true
isFunction(function* () {}); // true
isFunction(class Foo {}); // true
isFunction(Math.max); // true

isFunction({}); // false
isFunction(null); // false
```

#### `hasPlainObjectRecord`

Whether a plain object carries any own enumerable entry. **Throws** for anything
that is not a plain object.

```ts
hasPlainObjectRecord(val: unknown): boolean
```

```ts
hasPlainObjectRecord({}); // false
hasPlainObjectRecord({ a: 1 }); // true
hasPlainObjectRecord({ [Symbol("id")]: 1 }); // true — symbol keys count

hasPlainObjectRecord(new Map()); // throws Error
hasPlainObjectRecord(null); // throws Error
```

---

### Environment

#### `isClient` / `isServer`

Whether a `window` global exists. Safe to call anywhere — neither touches
`window` unless it is present, so both are SSR-safe.

```ts
isClient(): boolean
isServer(): boolean
```

```ts
// In a browser
isClient(); // true
isServer(); // false

// In Node
isClient(); // false
isServer(); // true
```

```ts
if (isClient()) {
  localStorage.setItem("visited", "1");
}
```

---

### Device

Both detectors accept an optional user agent. Pass one to test a string
directly — useful on the server, where request headers are the only source.
Omit it to read `navigator.userAgent`, which **throws** outside the browser.

#### `isAndroid`

```ts
isAndroid(userAgent?: string): boolean
```

```ts
isAndroid("Mozilla/5.0 (Linux; Android 14; Pixel 8)"); // true
isAndroid("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"); // false
isAndroid(""); // false — an empty string is still a supplied user agent

isAndroid(); // reads navigator; throws on the server
```

#### `isIos`

Also recognises **iPadOS 13 and newer**, which reports itself as "Macintosh" and
is otherwise indistinguishable from a desktop Mac. The tell is touch support, so
this only applies when reading the live navigator; a supplied string is judged
on its own.

```ts
isIos(userAgent?: string): boolean
```

```ts
isIos("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"); // true
isIos("Mozilla/5.0 (iPad; CPU OS 17_0)"); // true
isIos("Mozilla/5.0 (Linux; Android 14)"); // false
isIos(""); // false

isIos(); // reads navigator, including the iPadOS check
```

Server-side usage from a request header:

```ts
const ua = request.headers["user-agent"] ?? "";
const isMobile = isIos(ua) || isAndroid(ua);
```

---

### Utilities

#### `normalize`

Express a value as a percentage of a maximum. Capped at 100 and rounded to two
decimals.

```ts
normalize(value: number, max: number): number
```

```ts
normalize(50, 200); // 25
normalize(1, 3); // 33.33
normalize(2, 3); // 66.67
normalize(100, 100); // 100
normalize(150, 100); // 100 — capped
normalize(0, 100); // 0
```

Throws on invalid input:

```ts
normalize(5, 0); // RangeError — max must be greater than 0
normalize(5, -10); // RangeError
normalize(-1, 100); // RangeError — value must be non-negative
normalize(NaN, 100); // Error — Max or value must be number
normalize(null as any, 100); // Error — non-numbers are rejected
```

#### `sleep`

Pause for a number of milliseconds.

```ts
sleep(time: number): Promise<void>
```

```ts
const pollEverySecond = async () => {
  while (running) {
    await check();
    await sleep(1000);
  }
};
```

#### `watcher`

Wrap an object in a proxy that reports every change. Assignments and deletions
both notify; a redundant assignment does not. The proxy writes through, so the
original object stays in sync.

```ts
watcher<T extends object>(target: T, onChange: WatcherCallback<T>): T

type WatcherCallback<T extends object> = (
  key: keyof T,
  value: T[keyof T] | undefined,      // undefined when the key was deleted
  previous: T[keyof T] | undefined
) => void;
```

```ts
const state = watcher({ count: 0, name: "Ada" }, (key, value, previous) => {
  console.log(`${String(key)}: ${previous} → ${value}`);
});

state.count = 1; // "count: 0 → 1"
state.count = 1; // nothing — the value did not change
state.name = "Grace"; // "name: Ada → Grace"
delete state.count; // "count: 1 → undefined"
```

Notes:

- Equality uses `Object.is`, so assigning `NaN` over `NaN` is not a change.
- Assigning to a key that does not exist yet always reports, even if the value
  is `undefined`.
- Setters on the target still run; the watcher does not bypass them.
- Arrays work, but a single `push` reports both the new index and `length`.

#### `withRetry`

Run an async function, retrying with exponential backoff while it fails with a
given error type. Returns `null` once the attempts are exhausted. Any other
error class is rethrown immediately, without retrying.

```ts
withRetry<T>(props: {
  fn: () => Promise<T>;
  retries: number;   // total attempts, not extra attempts
  delay: number;     // base delay in ms; waits delay * 2 ** attemptIndex
  exception: new (...args: any[]) => Error;
}): Promise<T | null>
```

```ts
class NetworkError extends Error {}

const data = await withRetry({
  fn: () => fetchFromApi(),
  retries: 3,
  delay: 100, // waits 100ms after the first failure, then 200ms
  exception: NetworkError,
});

if (data === null) {
  // all three attempts threw a NetworkError
}
```

```ts
// A different error class is not retried
await withRetry({
  fn: async () => {
    throw new TypeError("bad input");
  },
  retries: 3,
  delay: 100,
  exception: NetworkError,
}); // rejects with the TypeError immediately
```

Pass `exception: Error` to retry every error. Note that `retries: 0` returns
`null` without ever calling `fn`.

---

## How values are compared

`isDeepEqual` and `deepClone` classify values the same way. Knowing the table
explains both.

| Input                                       | `isDeepEqual`                        | `deepClone`                     |
| ------------------------------------------- | ------------------------------------ | ------------------------------- |
| Primitives                                   | `Object.is` — `NaN` matches, `0 ≠ -0` | Returned as-is                  |
| Plain objects, arrays                        | By content, key order irrelevant     | Deep copy, holes preserved      |
| `Date`                                       | By timestamp                         | New `Date`                      |
| `RegExp`                                     | By source and flags                  | New `RegExp`, `lastIndex` kept  |
| `Map`, `Set`                                 | By content, insertion order irrelevant | New `Map` / `Set`, entries cloned |
| `Error`                                      | By name and message                  | Same class, stack and cause kept |
| Boxed `Number` / `String` / `Boolean`        | By primitive value                   | Deep copy                       |
| `ArrayBuffer`, `DataView`, typed arrays      | Byte by byte                         | New buffer, bytes copied        |
| `URL`, `URLSearchParams`                     | By string form                       | Deep copy                       |
| Class instances                              | Same prototype **and** same fields   | Same prototype, fields copied   |
| Functions                                    | Reference only                       | Shared by reference             |
| `WeakMap`, `WeakSet`, `Promise`, generators, DOM nodes | Reference only            | Shared by reference             |
| Circular references                          | Handled                              | Handled                         |

Only **own enumerable** properties participate, including symbol keys.
Inherited properties are ignored.

---

## TypeScript

Types ship with the package; nothing extra to install.

```ts
import {
  isDefined,
  watcher,
  type WatcherCallback,
} from "@ahmetilhn/handy-utils";
```

Every `is*` function is a type predicate, so narrowing works in conditionals,
ternaries and `.filter()`:

```ts
declare const input: unknown;

if (isPlainObject(input)) {
  input.anyKey; // Record<string, unknown>
}

const cleaned = ["a", null, "b"].filter(isDefined); // string[]
```

`deepClone` preserves the input type:

```ts
const copy = deepClone({ list: [1, 2], when: new Date() });
// { list: number[]; when: Date }
```

---

## Breaking changes in 4.0.0

`isDeepEqual`, `deepClone`, `isPlainObject` and `isFunction` returned wrong
answers for several common inputs. Fixing them changes observable behaviour.

| Case                                                          | 3.x                              | 4.0.0                                                       |
| -------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| `isPlainObject(new Map())`, `new URL()`, class instances        | `true`                           | `false` — only literals and `Object.create(null)` are plain  |
| `isDeepEqual` on two `Map`/`Set`/`RegExp`/`Error`/`URL` values   | `true` regardless of content     | Compared by value                                            |
| `isDeepEqual(NaN, NaN)`                                         | `false`                          | `true`                                                       |
| `isDeepEqual(0, -0)`                                            | `true`                           | `false`                                                      |
| `isDeepEqual` on two functions with equal source                | `true` (compared `toString()`)   | `false` — only the same reference is equal                   |
| `isDeepEqual` on circular input                                 | `RangeError`                     | Handled                                                      |
| `deepClone(new Map())`, `RegExp`, class instance                | `{}` — type and prototype lost   | Correct type and prototype                                   |
| `deepClone` on circular input                                   | `RangeError`                     | Handled                                                      |
| `deepClone([, 1, , 2])`                                         | `[1, 2]` — holes compacted       | Length and holes preserved                                   |
| `isFunction(async () => {})`, generators                        | `false`                          | `true`                                                       |
| `watcher`: assigning `undefined` to a new key                   | Key silently never created       | Key created, change reported                                 |
| `watcher`: `delete proxy.key`                                   | Deleted without notifying        | Reported as a change with `undefined`                        |
| `isNumber(Infinity)`                                            | `true`, while `NaN` was `false`  | `false` — finite numbers only                                |
| `normalize(null, max)`                                          | `null` coerced to 0 and accepted | Throws, as the message always promised                       |
| `isAndroid("")` / `isIos("")`                                   | Threw "only works on client"     | `false` — an empty UA is still a UA                          |
| `hasPlainObjectRecord({ [Symbol()]: 1 })`                       | `false` — symbols invisible      | `true`                                                       |
| `isDefined` narrowing                                           | Narrowed nothing                 | Narrows to `NonNullable<T>`                                  |
| `sleep(ms)` return type                                         | `Promise<unknown>`               | `Promise<void>`                                              |

`isDeepEqual` and `deepClone` also gained support for typed arrays,
`ArrayBuffer`, `DataView`, boxed primitives and enumerable symbol keys.
`isIos()` gained iPadOS 13+ detection. The minimum Node.js version is now 24.

The function comparison is the change most likely to affect callers: two
functions with identical source can capture different closure state, so they are
not interchangeable. Compare functions by reference, as lodash and Node's
`assert.deepStrictEqual` do.

---

## Contributing

```bash
npm install
npm run verify   # typecheck, test with coverage, build
```

239 tests, enforced at 100% for statements, branches, functions and lines.

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

## License

MIT © [Ahmet ilhan](https://github.com/ahmetilhn)
