const normalize = (value: number, max: number): number => {
  if (isNaN(max) || isNaN(value))
    throw new Error("Max or value must be number");
  if (max <= 0) throw new RangeError("max must be greater than 0");
  if (value < 0) throw new RangeError("value must be non-negative");

  return Math.round(Math.min((value / max) * 100, 100) * 100) / 100;
};

export default normalize;
