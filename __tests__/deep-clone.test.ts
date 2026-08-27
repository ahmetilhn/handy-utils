import deepClone from "@/modules/deep-clone";
describe("deepClone tests", () => {
  test("should return object after deepClone", () => {
    const clonedVal = deepClone({ name: "test" });
    expect(clonedVal).not.toBe({ name: "test" });
    expect(clonedVal).toStrictEqual({ name: "test" });
  });

  test("should return object after deepClone", () => {
    const mockData = {
      product: { info: { title: "Product title" } },
    };
    const clonedVal = deepClone(mockData);
    expect(clonedVal).not.toBe(mockData);
    expect(clonedVal).toStrictEqual(mockData);
  });

  test("should return array after deepClone", () => {
    const mockData = ["Test 1", "Test 2"];
    const clonedVal = deepClone(mockData);
    expect(clonedVal).not.toBe(mockData);
    expect(clonedVal).toStrictEqual(mockData);
  });

  test("should return object of array after deepClone", () => {
    const mockData = [{ title: "Test 1" }];
    const clonedVal = deepClone(mockData);
    expect(clonedVal).not.toBe(mockData);
    expect(clonedVal).toStrictEqual(mockData);
  });
  test("should return false while changed nested object value after deepClone", () => {
    const product = { title: "Test 1" };
    const products = [product];
    const clonedVal = deepClone<Array<object>>(products);
    product.title = "Test 2";
    expect(clonedVal[0]).not.toBe(product);
  });
  test("should return undefined when got undefined argument", () => {
    expect(deepClone(undefined)).toStrictEqual(undefined);
  });
  test("should return undefined when got null argument", () => {
    expect(deepClone(null)).toStrictEqual(null);
  });
  test("should return date when got date argument", () => {
    const date = new Date();
    expect(deepClone(date)).toStrictEqual(date);
  });
  test("should return copied val when got big object", () => {
    const objToCopy = {
      name: "Ahmet",
      age: 24,
      isDeveloper: true,
      skills: ["JavaScript", "Java", "Python"],
      languages: [
        {
          key: "en",
          level: 1000,
          awards: [
            {
              name: "Best of year",
              otherWinners: [
                { name: "John" },
                { name: "Jack" },
                { name: "Henry", children: [{ name: "Jula" }] },
              ],
            },
          ],
        },
      ],
      details: {
        address: {
          city: "Istanbul",
          zipCode: 34000,
          location: {
            lat: 41.0082,
            long: 28.9784,
          },
        },
        workExperience: [
          {
            company: "Company A",
            years: 2,
            technologies: ["React", "Node.js"],
          },
          {
            company: "Company B",
            years: 1,
            technologies: ["Java", "Spring"],
          },
        ],
      },
      contact: {
        email: "ahmet@example.com",
        phones: ["555-1234", "555-5678"],
      },
      createdAt: new Date(),
      idGenerator: function () {
        return this.name + Math.random().toString(36).substr(2, 9);
      },
      references: [
        {
          name: "John Doe",
          relation: "Manager",
          contactInfo: {
            email: "john@example.com",
            phone: "555-8765",
          },
        },
      ],
      nullValue: null,
      undefinedValue: undefined,
    };
    const deepCopyObj = deepClone(objToCopy);
    expect(deepCopyObj).not.toBe(objToCopy);
    expect(deepCopyObj).toStrictEqual(objToCopy);
    expect(deepCopyObj.createdAt).toStrictEqual(deepCopyObj.createdAt);

    expect(deepCopyObj.name).toStrictEqual(objToCopy.name);
    expect(deepCopyObj.age).toStrictEqual(objToCopy.age);
    expect(deepCopyObj.isDeveloper).toStrictEqual(objToCopy.isDeveloper);

    expect(deepCopyObj.skills).toStrictEqual(objToCopy.skills);
    expect(deepCopyObj.skills).not.toBe(objToCopy.skills);

    expect(deepCopyObj.languages).toStrictEqual(objToCopy.languages);
    expect(deepCopyObj.languages).not.toBe(objToCopy.languages);

    expect(deepCopyObj.details).toStrictEqual(objToCopy.details);
    expect(deepCopyObj.details).not.toBe(objToCopy.details);

    expect(deepCopyObj.contact).toStrictEqual(objToCopy.contact);
    expect(deepCopyObj.contact).not.toBe(objToCopy.contact);

    expect(deepCopyObj.details.workExperience).toStrictEqual(
      objToCopy.details.workExperience
    );
    expect(deepCopyObj.details.workExperience).not.toBe(
      objToCopy.details.workExperience
    );

    expect(deepCopyObj.languages[0].awards).toStrictEqual(
      objToCopy.languages[0].awards
    );
    expect(deepCopyObj.languages[0].awards).not.toBe(
      objToCopy.languages[0].awards
    );

    expect(deepCopyObj.languages[0].awards[0].otherWinners).toStrictEqual(
      objToCopy.languages[0].awards[0].otherWinners
    );
    expect(deepCopyObj.languages[0].awards[0].otherWinners).not.toBe(
      objToCopy.languages[0].awards[0].otherWinners
    );

    expect(
      deepCopyObj.languages[0].awards[0].otherWinners[2].children
    ).toStrictEqual(objToCopy.languages[0].awards[0].otherWinners[2].children);
    expect(
      deepCopyObj.languages[0].awards[0].otherWinners[2].children
    ).not.toBe(objToCopy.languages[0].awards[0].otherWinners[2].children);

    expect(deepCopyObj.createdAt).toStrictEqual(objToCopy.createdAt);
    expect(deepCopyObj.createdAt).not.toBe(objToCopy.createdAt);

    expect(deepCopyObj.idGenerator()).not.toStrictEqual(
      objToCopy.idGenerator()
    );

    expect(deepCopyObj.references).toStrictEqual(objToCopy.references);
    expect(deepCopyObj.references).not.toBe(objToCopy.references);

    expect(deepCopyObj.nullValue).toBeNull();
    expect(deepCopyObj.undefinedValue).toBeUndefined();
  });

  test("it should return copied val when got function in record", () => {
    const obj = { fn: () => "hello" };
    expect(deepClone(obj)).not.toBe(obj);
    expect(deepClone(obj)).toStrictEqual(obj);
  });

  describe("primitives", () => {
    test("should return primitives untouched", () => {
      expect(deepClone(1)).toBe(1);
      expect(deepClone("a")).toBe("a");
      expect(deepClone(true)).toBe(true);
      expect(deepClone(NaN)).toBeNaN();
      expect(deepClone(BigInt(9))).toBe(BigInt(9));
      const symbol = Symbol("s");
      expect(deepClone(symbol)).toBe(symbol);
    });

    test("should share functions by reference", () => {
      const fn = () => "hello";
      expect(deepClone(fn)).toBe(fn);
    });
  });

  describe("circular and shared references", () => {
    test("should not overflow on a self-referential object", () => {
      const node: Record<string, unknown> = { name: "root" };
      node.self = node;

      const copy = deepClone(node);

      expect(copy).not.toBe(node);
      expect(copy.name).toBe("root");
      expect(copy.self).toBe(copy);
    });

    test("should not overflow on mutually referential objects", () => {
      const a: Record<string, unknown> = { name: "a" };
      const b: Record<string, unknown> = { name: "b", a };
      a.b = b;

      const copy = deepClone(a);

      expect((copy.b as Record<string, unknown>).a).toBe(copy);
    });

    test("should not overflow on a self-referential array", () => {
      const arr: unknown[] = [1];
      arr.push(arr);

      const copy = deepClone(arr);

      expect(copy[0]).toBe(1);
      expect(copy[1]).toBe(copy);
    });

    test("should preserve shared references as shared", () => {
      const shared = { value: 1 };
      const source = { one: shared, two: shared };

      const copy = deepClone(source);

      expect(copy.one).not.toBe(shared);
      expect(copy.one).toBe(copy.two);
    });

    test("should survive deeply nested structures", () => {
      let root: Record<string, unknown> = { depth: 0 };
      const head = root;
      for (let i = 1; i < 500; i++) {
        const next: Record<string, unknown> = { depth: i };
        root.next = next;
        root = next;
      }

      const copy = deepClone(head);

      expect(copy).not.toBe(head);
      expect(copy.depth).toBe(0);
    });
  });

  describe("built-in types", () => {
    test("should clone a Map into a real Map", () => {
      const source = new Map<string, { n: number }>([["a", { n: 1 }]]);

      const copy = deepClone(source);

      expect(copy).toBeInstanceOf(Map);
      expect(copy).not.toBe(source);
      expect(copy.get("a")).toEqual({ n: 1 });
      expect(copy.get("a")).not.toBe(source.get("a"));
    });

    test("should clone a Set into a real Set", () => {
      const inner = { n: 1 };
      const source = new Set([inner]);

      const copy = deepClone(source);

      expect(copy).toBeInstanceOf(Set);
      expect(copy.has(inner)).toBe(false);
      expect([...copy][0]).toEqual(inner);
    });

    test("should clone a RegExp with flags and lastIndex", () => {
      const source = /foo/gi;
      source.lastIndex = 2;

      const copy = deepClone(source);

      expect(copy).toBeInstanceOf(RegExp);
      expect(copy).not.toBe(source);
      expect(copy.source).toBe("foo");
      expect(copy.flags).toBe("gi");
      expect(copy.lastIndex).toBe(2);
    });

    test("should clone a Date into a real Date", () => {
      const source = new Date("2020-01-01T00:00:00.000Z");

      const copy = deepClone(source);

      expect(copy).toBeInstanceOf(Date);
      expect(copy).not.toBe(source);
      expect(copy.getTime()).toBe(source.getTime());
    });

    test("should clone an Error with its message and name", () => {
      const source = new TypeError("boom");
      (source as TypeError & { detail?: string }).detail = "extra";

      const copy = deepClone(source);

      expect(copy).toBeInstanceOf(TypeError);
      expect(copy).not.toBe(source);
      expect(copy.message).toBe("boom");
      expect(copy.name).toBe("TypeError");
      expect((copy as TypeError & { detail?: string }).detail).toBe("extra");
    });

    test("should clone an Error cause chain", () => {
      const source = new Error("outer", { cause: new Error("inner") });

      const copy = deepClone(source);

      expect(copy.message).toBe("outer");
      expect((copy.cause as Error).message).toBe("inner");
      expect(copy.cause).not.toBe(source.cause);
    });

    test("should clone an Error without a cause", () => {
      const copy = deepClone(new Error("plain"));

      expect(copy.message).toBe("plain");
      expect("cause" in copy).toBe(false);
    });

    test("should clone typed arrays and buffers by value", () => {
      const typed = new Uint8Array([1, 2, 3]);
      const typedCopy = deepClone(typed);
      expect(typedCopy).toBeInstanceOf(Uint8Array);
      expect(typedCopy).not.toBe(typed);
      expect(Array.from(typedCopy)).toEqual([1, 2, 3]);
      typedCopy[0] = 9;
      expect(typed[0]).toBe(1);

      const buffer = new ArrayBuffer(4);
      const bufferCopy = deepClone(buffer);
      expect(bufferCopy).toBeInstanceOf(ArrayBuffer);
      expect(bufferCopy).not.toBe(buffer);
      expect(bufferCopy.byteLength).toBe(4);

      const view = new DataView(new ArrayBuffer(2));
      view.setUint8(0, 7);
      const viewCopy = deepClone(view);
      expect(viewCopy).toBeInstanceOf(DataView);
      expect(viewCopy.getUint8(0)).toBe(7);
    });

    test("should share weak collections and promises by reference", () => {
      const weakMap = new WeakMap();
      const weakSet = new WeakSet();
      const promise = Promise.resolve(1);

      expect(deepClone(weakMap)).toBe(weakMap);
      expect(deepClone(weakSet)).toBe(weakSet);
      expect(deepClone(promise)).toBe(promise);
    });
  });

  describe("prototypes and exotic keys", () => {
    test("should preserve the prototype of class instances", () => {
      class Person {
        constructor(public name: string) {}
        greet(): string {
          return `hi ${this.name}`;
        }
      }
      const source = new Person("Ada");

      const copy = deepClone(source);

      expect(copy).toBeInstanceOf(Person);
      expect(copy).not.toBe(source);
      expect(copy.greet()).toBe("hi Ada");
    });

    test("should preserve prototype-less objects", () => {
      const source = Object.create(null) as Record<string, unknown>;
      source.a = 1;

      const copy = deepClone(source);

      expect(Object.getPrototypeOf(copy)).toBeNull();
      expect(copy.a).toBe(1);
    });

    test("should copy own enumerable symbol keys", () => {
      const key = Symbol("id");
      const source = { [key]: { n: 1 } };

      const copy = deepClone(source);

      expect(copy[key]).toEqual({ n: 1 });
      expect(copy[key]).not.toBe(source[key]);
    });

    test("should skip non-enumerable symbol keys", () => {
      const visible = Symbol("visible");
      const hidden = Symbol("hidden");
      const source: Record<symbol, number> = { [visible]: 1 };
      Object.defineProperty(source, hidden, { value: 2, enumerable: false });

      const copy = deepClone(source);

      expect(copy[visible]).toBe(1);
      expect(Object.prototype.hasOwnProperty.call(copy, hidden)).toBe(false);
    });

    test("should not copy inherited properties as own", () => {
      const proto = { inherited: true };
      const source = Object.create(proto) as Record<string, unknown>;
      source.own = 1;

      const copy = deepClone(source);

      expect(Object.prototype.hasOwnProperty.call(copy, "inherited")).toBe(
        false
      );
      expect(copy.inherited).toBe(true);
      expect(copy.own).toBe(1);
    });
  });

  describe("arrays", () => {
    test("should preserve length and holes of sparse arrays", () => {
      const source = [, 1, , 2] as unknown[];

      const copy = deepClone(source);

      expect(copy.length).toBe(4);
      expect(0 in copy).toBe(false);
      expect(copy[1]).toBe(1);
      expect(2 in copy).toBe(false);
      expect(copy[3]).toBe(2);
    });

    test("should copy non-index properties set on an array", () => {
      const source = [1, 2] as unknown[] & { meta?: string };
      source.meta = "extra";

      const copy = deepClone(source);

      expect(copy.length).toBe(2);
      expect(copy.meta).toBe("extra");
    });
  });

  test("mutating the clone should never affect the source", () => {
    const source = {
      list: [{ n: 1 }],
      map: new Map([["k", { n: 2 }]]),
      set: new Set([{ n: 3 }]),
      when: new Date("2020-01-01T00:00:00.000Z"),
    };

    const copy = deepClone(source);
    copy.list[0].n = 100;
    (copy.map.get("k") as { n: number }).n = 200;
    copy.when.setFullYear(1999);

    expect(source.list[0].n).toBe(1);
    expect((source.map.get("k") as { n: number }).n).toBe(2);
    expect(source.when.getUTCFullYear()).toBe(2020);
  });
});
