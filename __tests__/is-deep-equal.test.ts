import isDeepEqual from "@/modules/is-deep-equal";

describe("isDeepEqual tests", () => {
  test("should return false for different strings", () => {
    expect(isDeepEqual("test", "Test")).toBe(false);
  });

  test("should return false for different types", () => {
    expect(isDeepEqual("test", 1)).toBe(false);
    expect(isDeepEqual(2, "Test")).toBe(false);
    expect(isDeepEqual(["ahmet"], { test: 2 })).toBe(false);
  });

  test("should return false for different numbers", () => {
    expect(isDeepEqual(1, 2)).toBe(false);
  });

  test("should return false for null vs other types", () => {
    expect(isDeepEqual(null, 1)).toBe(false);
    expect(isDeepEqual(null, NaN)).toBe(false);
    expect(isDeepEqual(null, undefined)).toBe(false);
  });

  test("should return false for NaN comparisons", () => {
    expect(isDeepEqual(NaN, undefined)).toBe(false);
    expect(isDeepEqual(NaN, NaN)).toBe(false);
  });

  test("should return false for objects with different values", () => {
    expect(isDeepEqual({ test: 1 }, { test: 2 })).toBe(false);
  });

  test("should return false for objects with different keys", () => {
    expect(isDeepEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(isDeepEqual({ a: undefined }, { b: undefined })).toBe(false);
  });

  test("should return false for different arrays", () => {
    expect(isDeepEqual(["ahmet"], ["metin"])).toBe(false);
    expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  test("should return false for different dates", () => {
    expect(
      isDeepEqual(new Date("2011-10-12"), new Date("2011-10-10"))
    ).toBe(false);
  });

  test("should return true for identical primitives", () => {
    expect(isDeepEqual(1, 1)).toBe(true);
    expect(isDeepEqual("2", "2")).toBe(true);
    expect(isDeepEqual(null, null)).toBe(true);
    expect(isDeepEqual(undefined, undefined)).toBe(true);
  });

  test("should return true for empty objects and arrays", () => {
    expect(isDeepEqual({}, {})).toBe(true);
    expect(isDeepEqual([], [])).toBe(true);
  });

  test("should return true for equal arrays", () => {
    expect(isDeepEqual([10, 2], [10, 2])).toBe(true);
    expect(isDeepEqual(["ahmet"], ["ahmet"])).toBe(true);
    expect(isDeepEqual([{ key: "value" }], [{ key: "value" }])).toBe(true);
  });

  test("should return true for equal dates", () => {
    expect(
      isDeepEqual(new Date("2011-10-10"), new Date("2011-10-10"))
    ).toBe(true);
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
        { name: "test", test: { a: { b: { c: { d: { e: () => 10 } } } } } },
        { name: "test", test: { a: { b: { c: { d: { e: () => 10 } } } } } }
      )
    ).toBe(true);
  });

  test("should return false for deeply nested unequal objects", () => {
    expect(
      isDeepEqual(
        { name: "test", test: { a: { b: { c: { d: { e: () => 10 } } } } } },
        { name: "test", test: { a: 1 } }
      )
    ).toBe(false);
  });

  test("should return true for same functions", () => {
    expect(
      isDeepEqual(
        function () {
          return Math.random().toString(36).substr(2, 9);
        },
        function () {
          return Math.random().toString(36).substr(2, 9);
        }
      )
    ).toBe(true);
  });

  test("should return correct value for big objects", () => {
    const bigObjOne = {
      name: "Ahmet",
      age: 24,
      isDeveloper: true,
      skills: ["JavaScript", "Java", "Python"],
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
      createdAt: new Date("Thu Sep 05 2024 16:15:42 GMT+0300 (GMT+03:00)"),
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
    const bigObjTwo = {
      name: "Ahmet",
      age: 24,
      isDeveloper: true,
      skills: ["JavaScript", "Java", "Python"],
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
      createdAt: new Date("Thu Sep 05 2024 16:15:42 GMT+0300 (GMT+03:00)"),
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
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);
    bigObjTwo.age = 30;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
    bigObjTwo.age = 24;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);
    bigObjTwo.createdAt = new Date();
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
    bigObjTwo.createdAt = bigObjOne.createdAt;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(true);
    // @ts-ignore: Unreachable code error
    bigObjOne.idGenerator = null;
    expect(isDeepEqual(bigObjOne, bigObjTwo)).toBe(false);
  });
});
