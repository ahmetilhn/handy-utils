import watcher from "@/modules/watcher";

describe("watcher tests", () => {
  test("should trigger onChange when value changes", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 0 }, onChange);

    state.count = 1;

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("count", 1, 0);
  });

  test("should not trigger onChange when same value is assigned", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 0 }, onChange);

    state.count = 0;

    expect(onChange).not.toHaveBeenCalled();
  });

  test("should watch multiple fields", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 0, name: "Ahmet" }, onChange);

    state.count = 5;
    state.name = "Mehmet";

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, "count", 5, 0);
    expect(onChange).toHaveBeenNthCalledWith(2, "name", "Mehmet", "Ahmet");
  });

  test("should not trigger onChange when NaN is assigned to NaN", () => {
    const onChange = jest.fn();
    const state = watcher({ value: NaN }, onChange);

    state.value = NaN;

    expect(onChange).not.toHaveBeenCalled();
  });

  test("should pass undefined as old value when transitioning from undefined", () => {
    const onChange = jest.fn();
    const state = watcher({ label: undefined as string | undefined }, onChange);

    state.label = "test";

    expect(onChange).toHaveBeenCalledWith("label", "test", undefined);
  });

  test("should mutate the original object through proxy", () => {
    const original = { count: 0 };
    const state = watcher(original, jest.fn());

    state.count = 42;

    expect(original.count).toBe(42);
  });
});