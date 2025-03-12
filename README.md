# handy-utils

Handy utils offers developers a powerful and easy-to-use toolset. With its clean, modular and scalable code structure, it accelerates development processes and reduces code complexity. With a wide range of functions, it offers ready-made methods for solving common problems.

<p align="center">
  <a href="https://www.npmjs.com/package/@ahmetilhn/handy-utils"><img alt="NPM" src="https://img.shields.io/npm/v/@ahmetilhn/handy-utils.svg" /></a>
  <a href="https://img.shields.io/npm/dy/@ahmetilhn/handy-utils"><img alt="NPM" src="https://img.shields.io/npm/dy/@ahmetilhn/handy-utils" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
</p>
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

Clone data from any data (disconnect any data binding)

###### Function Signature

```ts
deepClone(val: any): typeof val
```

###### Examples

```ts
const clonedVal = deepClone({ name: "test" });
expect(clonedVal).not.toBe({ name: "test" }); // reference equal
expect(clonedVal).toEqual(clonedVal); // soft equal
```

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

Checks the equality of two values.

###### Function Signature

```ts
isDeepEqual(valOne: any, valTwo: any): boolean
```

###### Examples

```ts
isDeepEqual(10, 10); // true

isDeepEqual("test", 1); // false

isDeepEqual(null, 1); // false

isDeepEqual(null, NaN); // false

isDeepEqual(NaN, NaN); // false

isDeepEqual({ name: "john" }, { name: "john" }); // true

isDeepEqual(["john"], ["john"]); // true

isDeepEqual([{ key: "value" }], [{ key: "value" }]); // true
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

Check if val is an function

###### Function Signature

```ts
isFunction(val: any): boolean
```

###### Examples

```ts
isFunction(NaN); // false
isFunction(() => {}); // true
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

## Test Coverage Result

branches: 94
functions: 100
lines: 100
statements: 97

_created by Ahmet ilhan_
