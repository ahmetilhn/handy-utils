import isDeepEqual from "@/modules/is-deep-equal";

describe("isDeepEqual tests", () => {
  describe("primitives", () => {
    test("should return false for different strings", () => {
      expect(isDeepEqual("test", "Test")).toBe(false);
    });

    test("should return false for different types", () => {
      expect(isDeepEqual("test", 1)).toBe(false);
      expect(isDeepEqual(2, "Test")).toBe(false);
      expect(isDeepEqual(["ahmet"], { test: 2 })).toBe(false);
      expect(isDeepEqual(1, "1")).toBe(false);
      expect(isDeepEqual(0, false)).toBe(false);
      expect(isDeepEqual("", false)).toBe(false);
    });

    test("should return false for different numbers", () => {
      expect(isDeepEqual(1, 2)).toBe(false);
    });

    test("should return false for null vs other types", () => {
      expect(isDeepEqual(null, 1)).toBe(false);
      expect(isDeepEqual(null, NaN)).toBe(false);
      expect(isDeepEqual(null, undefined)).toBe(false);
      expect(isDeepEqual(null, {})).toBe(false);
      expect(isDeepEqual({}, null)).toBe(false);
    });

    test("should treat NaN as equal to NaN", () => {
      expect(isDeepEqual(NaN, NaN)).toBe(true);
      expect(isDeepEqual(NaN, undefined)).toBe(false);
      expect(isDeepEqual([NaN], [NaN])).toBe(true);
      expect(isDeepEqual({ a: NaN }, { a: NaN })).toBe(true);
    });

    test("should distinguish 0 from -0", () => {
      expect(isDeepEqual(0, -0)).toBe(false);
      expect(isDeepEqual([0], [-0])).toBe(false);
      expect(isDeepEqual(0, 0)).toBe(true);
      expect(isDeepEqual(-0, -0)).toBe(true);
    });

    test("should return true for identical primitives", () => {
      expect(isDeepEqual(1, 1)).toBe(true);
      expect(isDeepEqual("2", "2")).toBe(true);
      expect(isDeepEqual(null, null)).toBe(true);
      expect(isDeepEqual(undefined, undefined)).toBe(true);
      expect(isDeepEqual(true, true)).toBe(true);
    });

    test("should compare bigint values", () => {
      expect(isDeepEqual(BigInt(9), BigInt(9))).toBe(true);
      expect(isDeepEqual(BigInt(9), BigInt(10))).toBe(false);
      expect(isDeepEqual(BigInt(9), 9)).toBe(false);
    });

    test("should compare symbols by identity", () => {
      const symbol = Symbol("a");
      expect(isDeepEqual(symbol, symbol)).toBe(true);
      expect(isDeepEqual(Symbol("a"), Symbol("a"))).toBe(false);
    });
  });

  describe("objects", () => {
    test("should return false for objects with different values", () => {
      expect(isDeepEqual({ test: 1 }, { test: 2 })).toBe(false);
    });

    test("should return false for objects with different keys", () => {
      expect(isDeepEqual({ a: 1 }, { b: 1 })).toBe(false);
      expect(isDeepEqual({ a: undefined }, { b: undefined })).toBe(false);
      expect(isDeepEqual({ a: undefined }, { z: 1 })).toBe(false);
    });

    test("should return false when key counts differ", () => {
      expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(isDeepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    test("should return true for empty objects and arrays", () => {
      expect(isDeepEqual({}, {})).toBe(true);
      expect(isDeepEqual([], [])).toBe(true);
    });

    test("should return true for deeply nested equal objects", () => {
      expect(
        isDeepEqual(
          { name: "test", test: { a: 1 } },
          { name: "test", test: { a: 1 } }
        )
      ).toBe(true);
      expect(
        isDeepEqual(
          { name: "test", test: { a: { b: { c: { d: { e: 10 } } } } } },
          { name: "test", test: { a: { b: { c: { d: { e: 10 } } } } } }
        )
      ).toBe(true);
    });

    test("should return false for deeply nested unequal objects", () => {
      expect(
        isDeepEqual(
          { name: "test", test: { a: { b: { c: { d: { e: 10 } } } } } },
          { name: "test", test: { a: 1 } }
        )
      ).toBe(false);
    });

    test("should compare prototype-less objects", () => {
      const one = Object.create(null);
      one.a = 1;
      const two = Object.create(null);
      two.a = 1;
      expect(isDeepEqual(one, two)).toBe(true);
      expect(isDeepEqual(one, { a: 1 })).toBe(true);
    });

    test("should compare own enumerable symbol keys", () => {
      const key = Symbol("id");
      expect(isDeepEqual({ [key]: 1 }, { [key]: 1 })).toBe(true);
      expect(isDeepEqual({ [key]: 1 }, { [key]: 2 })).toBe(false);
      expect(isDeepEqual({ [key]: 1 }, {})).toBe(false);
    });

    test("should ignore non-enumerable symbol keys", () => {
      const key = Symbol("hidden");
      const one = {};
      const two = {};
      Object.defineProperty(one, key, { value: 1, enumerable: false });
      Object.defineProperty(two, key, { value: 2, enumerable: false });
      expect(isDeepEqual(one, two)).toBe(true);
    });

    test("should compare arguments objects structurally", () => {
      function collector(): IArguments {
        // eslint-disable-next-line prefer-rest-params
        return arguments;
      }
      const collect = collector as (...args: unknown[]) => IArguments;

      expect(isDeepEqual(collect(1, 2), collect(1, 2))).toBe(true);
      expect(isDeepEqual(collect(1, 2), collect(1, 3))).toBe(false);
    });

    test("should ignore inherited properties", () => {
      const proto = { inherited: true };
      const one = Object.create(proto);
      one.own = 1;
      const two = Object.create(proto);
      two.own = 1;
      expect(isDeepEqual(one, two)).toBe(true);
    });
  });

  describe("class instances", () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }
    class Vector {
      constructor(
        public x: number,
        public y: number
      ) {}
    }

    test("should compare instances of the same class structurally", () => {
      expect(isDeepEqual(new Point(1, 2), new Point(1, 2))).toBe(true);
      expect(isDeepEqual(new Point(1, 2), new Point(3, 4))).toBe(false);
    });

    test("should not equate instances of different classes", () => {
      expect(isDeepEqual(new Point(1, 2), new Vector(1, 2))).toBe(false);
    });

    test("should not equate a class instance with a plain object", () => {
      expect(isDeepEqual(new Point(1, 2), { x: 1, y: 2 })).toBe(false);
    });
  });

  describe("arrays", () => {
    test("should return false for different arrays", () => {
      expect(isDeepEqual(["ahmet"], ["metin"])).toBe(false);
      expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    test("should return true for equal arrays", () => {
      expect(isDeepEqual([10, 2], [10, 2])).toBe(true);
      expect(isDeepEqual(["ahmet"], ["ahmet"])).toBe(true);
      expect(isDeepEqual([{ key: "value" }], [{ key: "value" }])).toBe(true);
    });

    test("should respect element order", () => {
      expect(isDeepEqual([1, 2], [2, 1])).toBe(false);
    });

    test("should not equate an array with an array-like object", () => {
      expect(isDeepEqual([1], { 0: 1, length: 1 })).toBe(false);
    });
  });

  describe("dates", () => {
    test("should return false for different dates", () => {
      expect(isDeepEqual(new Date("2011-10-12"), new Date("2011-10-10"))).toBe(
        false
      );
    });

    test("should return true for equal dates", () => {
      expect(isDeepEqual(new Date("2011-10-10"), new Date("2011-10-10"))).toBe(
        true
      );
    });

    test("should treat two invalid dates as equal", () => {
      expect(isDeepEqual(new Date("nope"), new Date("nope"))).toBe(true);
    });

    test("should not equate a date with its timestamp", () => {
      const date = new Date("2011-10-10");
      expect(isDeepEqual(date, date.getTime())).toBe(false);
    });
  });

  describe("regular expressions", () => {
    test("should distinguish different patterns", () => {
      expect(isDeepEqual(/foo/, /bar/)).toBe(false);
    });

    test("should distinguish different flags", () => {
      expect(isDeepEqual(/foo/g, /foo/i)).toBe(false);
    });

    test("should equate identical patterns and flags", () => {
      expect(isDeepEqual(/foo/gi, /foo/gi)).toBe(true);
    });
  });

  describe("maps", () => {
    test("should distinguish different entries", () => {
      expect(isDeepEqual(new Map([["a", 1]]), new Map([["b", 2]]))).toBe(false);
      expect(isDeepEqual(new Map([["a", 1]]), new Map([["a", 2]]))).toBe(false);
    });

    test("should equate identical entries regardless of order", () => {
      expect(
        isDeepEqual(
          new Map<string, number>([
            ["a", 1],
            ["b", 2],
          ]),
          new Map<string, number>([
            ["b", 2],
            ["a", 1],
          ])
        )
      ).toBe(true);
    });

    test("should compare sizes", () => {
      expect(isDeepEqual(new Map([["a", 1]]), new Map())).toBe(false);
      expect(isDeepEqual(new Map(), new Map())).toBe(true);
    });

    test("should structurally match object keys", () => {
      expect(
        isDeepEqual(new Map([[{ id: 1 }, "x"]]), new Map([[{ id: 1 }, "x"]]))
      ).toBe(true);
      expect(
        isDeepEqual(new Map([[{ id: 1 }, "x"]]), new Map([[{ id: 2 }, "x"]]))
      ).toBe(false);
      expect(
        isDeepEqual(new Map([[{ id: 1 }, "x"]]), new Map([[{ id: 1 }, "y"]]))
      ).toBe(false);
    });

    test("should compare nested values", () => {
      expect(
        isDeepEqual(new Map([["a", { b: 1 }]]), new Map([["a", { b: 1 }]]))
      ).toBe(true);
    });

    test("should not reuse an identity-matched key during structural matching", () => {
      const shared = { shared: true };
      const one = new Map<object, number>([
        [shared, 1],
        [{ other: 1 }, 2],
      ]);
      const two = new Map<object, number>([
        [shared, 1],
        [{ other: 1 }, 2],
      ]);
      expect(isDeepEqual(one, two)).toBe(true);
    });

    test("should consume each structural match only once", () => {
      const one = new Map<object, number>([
        [{ id: 1 }, 1],
        [{ id: 1 }, 2],
      ]);
      const two = new Map<object, number>([
        [{ id: 1 }, 1],
        [{ id: 1 }, 3],
      ]);
      expect(isDeepEqual(one, two)).toBe(false);
    });

    test("should return false when a primitive key is missing", () => {
      expect(isDeepEqual(new Map([["a", 1]]), new Map([["b", 1]]))).toBe(false);
    });
  });

  describe("sets", () => {
    test("should distinguish different members", () => {
      expect(isDeepEqual(new Set([1]), new Set([2]))).toBe(false);
    });

    test("should equate identical members regardless of order", () => {
      expect(isDeepEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    });

    test("should compare sizes", () => {
      expect(isDeepEqual(new Set([1]), new Set([1, 2]))).toBe(false);
      expect(isDeepEqual(new Set(), new Set())).toBe(true);
    });

    test("should structurally match object members", () => {
      expect(isDeepEqual(new Set([{ a: 1 }]), new Set([{ a: 1 }]))).toBe(true);
      expect(isDeepEqual(new Set([{ a: 1 }]), new Set([{ a: 2 }]))).toBe(false);
    });

    test("should not equate a set with a map", () => {
      expect(isDeepEqual(new Set([1]), new Map([[1, 1]]))).toBe(false);
    });

    test("should not reuse an identity-matched member during structural matching", () => {
      const shared = { shared: true };
      expect(
        isDeepEqual(
          new Set<object>([shared, { other: 1 }]),
          new Set<object>([shared, { other: 1 }])
        )
      ).toBe(true);
    });

    test("should return false when a structural member has no partner", () => {
      expect(isDeepEqual(new Set([{ a: 1 }]), new Set([{ b: 1 }]))).toBe(false);
    });

    test("should return false when a primitive member is missing", () => {
      expect(isDeepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    });
  });

  describe("errors", () => {
    test("should compare name and message", () => {
      expect(isDeepEqual(new Error("boom"), new Error("boom"))).toBe(true);
      expect(isDeepEqual(new Error("boom"), new Error("bang"))).toBe(false);
    });

    test("should distinguish error subclasses", () => {
      expect(isDeepEqual(new TypeError("x"), new RangeError("x"))).toBe(false);
    });
  });

  describe("boxed primitives", () => {
    test("should compare by primitive value", () => {
      /* eslint-disable no-new-wrappers */
      expect(isDeepEqual(new Number(1), new Number(1))).toBe(true);
      expect(isDeepEqual(new Number(1), new Number(2))).toBe(false);
      expect(isDeepEqual(new String("a"), new String("a"))).toBe(true);
      expect(isDeepEqual(new Boolean(true), new Boolean(true))).toBe(true);
      /* eslint-enable no-new-wrappers */
    });

    test("should not equate a boxed primitive with its primitive", () => {
      // eslint-disable-next-line no-new-wrappers
      expect(isDeepEqual(new Number(1), 1)).toBe(false);
    });
  });

  describe("binary data", () => {
    test("should compare typed arrays by content", () => {
      expect(isDeepEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(
        true
      );
      expect(isDeepEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(
        false
      );
      expect(isDeepEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(
        false
      );
    });

    test("should distinguish typed array kinds", () => {
      expect(isDeepEqual(new Uint8Array([1]), new Int8Array([1]))).toBe(false);
    });

    test("should compare array buffers by bytes", () => {
      expect(isDeepEqual(new ArrayBuffer(4), new ArrayBuffer(4))).toBe(true);
      expect(isDeepEqual(new ArrayBuffer(4), new ArrayBuffer(8))).toBe(false);
    });

    test("should compare data views by bytes", () => {
      const one = new DataView(new ArrayBuffer(2));
      const two = new DataView(new ArrayBuffer(2));
      expect(isDeepEqual(one, two)).toBe(true);
      two.setUint8(0, 5);
      expect(isDeepEqual(one, two)).toBe(false);
    });
  });

  describe("functions", () => {
    test("should equate a function only with itself", () => {
      const fn = () => 10;
      expect(isDeepEqual(fn, fn)).toBe(true);
    });

    test("should not equate distinct functions with identical source", () => {
      const make = (k: number) => (x: number) => x + k;
      expect(isDeepEqual(make(1), make(99))).toBe(false);
      expect(isDeepEqual(() => 10, () => 10)).toBe(false);
    });

    test("should compare objects holding the same function reference", () => {
      const fn = () => 10;
      expect(isDeepEqual({ fn }, { fn })).toBe(true);
      expect(isDeepEqual({ fn }, { fn: () => 10 })).toBe(false);
    });
  });

  describe("non-inspectable objects", () => {
    test("should compare weak collections and promises by reference", () => {
      const weakMap = new WeakMap();
      const promise = Promise.resolve(1);
      expect(isDeepEqual(weakMap, weakMap)).toBe(true);
      expect(isDeepEqual(weakMap, new WeakMap())).toBe(false);
      expect(isDeepEqual(new WeakSet(), new WeakSet())).toBe(false);
      expect(isDeepEqual(promise, promise)).toBe(true);
      expect(isDeepEqual(promise, Promise.resolve(1))).toBe(false);
    });

    test("should compare unrecognised exotic objects by reference", () => {
      function* generate(): Generator<number> {
        yield 1;
      }
      expect(isDeepEqual(generate(), generate())).toBe(false);
      expect(isDeepEqual(new WeakRef({ a: 1 }), new WeakRef({ a: 1 }))).toBe(
        false
      );

      const generator = generate();
      expect(isDeepEqual(generator, generator)).toBe(true);
    });

    test("should not collapse objects that hide state behind accessors", () => {
      expect(
        isDeepEqual(new URL("https://a.com"), new URL("https://b.com"))
      ).toBe(false);
      expect(
        isDeepEqual(new URL("https://a.com"), new URL("https://a.com"))
      ).toBe(true);
    });
  });

  describe("circular references", () => {
    test("should not overflow on self-referential objects", () => {
      const one: Record<string, unknown> = { name: "a" };
      one.self = one;
      const two: Record<string, unknown> = { name: "a" };
      two.self = two;
      expect(isDeepEqual(one, two)).toBe(true);
    });

    test("should still detect differences behind a cycle", () => {
      const one: Record<string, unknown> = { name: "a" };
      one.self = one;
      const two: Record<string, unknown> = { name: "b" };
      two.self = two;
      expect(isDeepEqual(one, two)).toBe(false);
    });

    test("should handle mutually referential objects", () => {
      const a1: Record<string, unknown> = {};
      const b1: Record<string, unknown> = { a: a1 };
      a1.b = b1;
      const a2: Record<string, unknown> = {};
      const b2: Record<string, unknown> = { a: a2 };
      a2.b = b2;
      expect(isDeepEqual(a1, a2)).toBe(true);
    });

    test("should compare one object against several partners in a single call", () => {
      const shared = { v: 1 };
      expect(
        isDeepEqual({ a: shared, b: shared }, { a: { v: 1 }, b: { v: 1 } })
      ).toBe(true);
      expect(
        isDeepEqual({ a: shared, b: shared }, { a: { v: 1 }, b: { v: 2 } })
      ).toBe(false);
    });

    test("should handle cycles through arrays and maps", () => {
      const arrOne: unknown[] = [1];
      arrOne.push(arrOne);
      const arrTwo: unknown[] = [1];
      arrTwo.push(arrTwo);
      expect(isDeepEqual(arrOne, arrTwo)).toBe(true);

      const mapOne = new Map<string, unknown>();
      mapOne.set("self", mapOne);
      const mapTwo = new Map<string, unknown>();
      mapTwo.set("self", mapTwo);
      expect(isDeepEqual(mapOne, mapTwo)).toBe(true);
    });
  });

  test("should return correct value for big objects", () => {
    const idGenerator = function (this: { name: string }) {
      return this.name;
    };
    const build = () => ({
      name: "Ahmet",
      age: 24,
      isDeveloper: true,
      skills: ["JavaScript", "Java", "Python"],
      details: {
        address: {
          city: "Istanbul",
          zipCode: 34000,
          location: { lat: 41.0082, long: 28.9784 },
        },
        workExperience: [
          { company: "Company A", years: 2, technologies: ["React", "Node.js"] },
          { company: "Company B", years: 1, technologies: ["Java", "Spring"] },
        ],
      },
      contact: {
        email: "ahmet@example.com",
        phones: ["555-1234", "555-5678"],
      },
      createdAt: new Date("2024-09-05T13:15:42.000Z"),
      idGenerator,
      references: [
        {
          name: "John Doe",
          relation: "Manager",
          contactInfo: { email: "john@example.com", phone: "555-8765" },
        },
      ],
      nullValue: null,
      undefinedValue: undefined,
    });

    const bigObjOne = build();
    const bigObjTwo = build();

    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);

    bigObjTwo.age = 30;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
    bigObjTwo.age = 24;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);

    bigObjTwo.createdAt = new Date();
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
    bigObjTwo.createdAt = bigObjOne.createdAt;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);

    bigObjTwo.details.address.location.lat = 0;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
    bigObjTwo.details.address.location.lat = 41.0082;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);

    // @ts-expect-error deliberately breaking the shape
    bigObjOne.idGenerator = null;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
  });
});
