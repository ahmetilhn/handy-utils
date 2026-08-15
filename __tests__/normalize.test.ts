import normalize from "@/modules/normalize";

describe("normalize tests", () => {
  test("should correctly normalize value to percentage", () => {
    expect(normalize(50, 200)).toBe(25);
    expect(normalize(1, 4)).toBe(25);
    expect(normalize(3, 4)).toBe(75);
  });

  test("should return 0 when value is zero", () => {
    expect(normalize(0, 100)).toBe(0);
  });

  test("should return 100 when value equals max", () => {
    expect(normalize(100, 100)).toBe(100);
  });

  test("should cap at 100 when value exceeds max", () => {
    expect(normalize(150, 100)).toBe(100);
    expect(normalize(1000, 50)).toBe(100);
  });

  test("should round result to 2 decimal places", () => {
    expect(normalize(1, 3)).toBe(33.33);
    expect(normalize(2, 3)).toBe(66.67);
  });

  test("should throw RangeError when max is zero or negative", () => {
    expect(() => normalize(5, 0)).toThrow(RangeError);
    expect(() => normalize(5, -10)).toThrow(RangeError);
  });

  test("should throw RangeError when value is negative", () => {
    expect(() => normalize(-1, 100)).toThrow(RangeError);
  });

  test("should throw error for NaN values", () => {
    expect(() => normalize(NaN, 100)).toThrow("Max or value must be number");
    expect(() => normalize(5, NaN)).toThrow("Max or value must be number");
    expect(() => normalize(NaN, NaN)).toThrow("Max or value must be number");
  });
});

describe("normalize input validation", () => {
  test("should reject non-numeric values that the global isNaN coerces", () => {
    // `isNaN(null)` is false because null coerces to 0, so null used to pass
    // validation and be normalised as zero.
    expect(() => normalize(null as unknown as number, 10)).toThrow(
      "Max or value must be number"
    );
    expect(() => normalize(10, null as unknown as number)).toThrow(
      "Max or value must be number"
    );
    expect(() => normalize("5" as unknown as number, 10)).toThrow(
      "Max or value must be number"
    );
    expect(() => normalize(true as unknown as number, 10)).toThrow(
      "Max or value must be number"
    );
    expect(() => normalize(undefined as unknown as number, 10)).toThrow(
      "Max or value must be number"
    );
  });
});
