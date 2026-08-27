const normalize = (value: number, max: number): number => {
  // The global `isNaN` coerces first, so `isNaN(null)` is false and a null slipped through this
  // guard to be treated as 0.
  if (
    typeof value !== "number" ||
    typeof max !== "number" ||
    Number.isNaN(value) ||
    Number.isNaN(max)
  ) {
    throw new Error("Max or value must be number");
  }
  if (max <= 0) throw new RangeError("max must be greater than 0");
  if (value < 0) throw new RangeError("value must be non-negative");

  return Math.round(Math.min((value / max) * 100, 100) * 100) / 100;
};

export default normalize;
