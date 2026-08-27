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

  test("should create a new key even when the assigned value is undefined", () => {
    const onChange = jest.fn();
    const state = watcher({} as { label?: string }, onChange);

    state.label = undefined;

    expect("label" in state).toBe(true);
    expect(onChange).toHaveBeenCalledWith("label", undefined, undefined);
  });

  test("should still skip a redundant assignment on an existing key", () => {
    const onChange = jest.fn();
    const state = watcher({ label: undefined as string | undefined }, onChange);

    state.label = undefined;

    expect(onChange).not.toHaveBeenCalled();
  });

  test("should report deletions", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 7 } as { count?: number }, onChange);

    delete state.count;

    expect("count" in state).toBe(false);
    expect(onChange).toHaveBeenCalledWith("count", undefined, 7);
  });

  test("should ignore deletion of a key that does not exist", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 1 } as { count?: number; other?: number }, onChange);

    delete state.other;

    expect(onChange).not.toHaveBeenCalled();
  });

  test("should route assignments through the target's setters", () => {
    const onChange = jest.fn();
    let backing = 0;
    const state = watcher(
      {
        get doubled(): number {
          return backing;
        },
        set doubled(next: number) {
          backing = next * 2;
        },
      },
      onChange
    );

    state.doubled = 5;

    expect(backing).toBe(10);
    expect(state.doubled).toBe(10);
  });

  test("should not report a change when the write is rejected", () => {
    const onChange = jest.fn();
    const state = watcher(Object.freeze({ count: 0 }), onChange) as {
      count: number;
    };

    expect(() => {
      state.count = 1;
    }).toThrow(TypeError);
    expect(state.count).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("should not report a change when the deletion is rejected", () => {
    const onChange = jest.fn();
    const target = {} as { pinned?: number };
    Object.defineProperty(target, "pinned", {
      value: 1,
      configurable: false,
      enumerable: true,
      writable: true,
    });
    const state = watcher(target, onChange);

    expect(() => {
      delete state.pinned;
    }).toThrow(TypeError);
    expect(state.pinned).toBe(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("should track array mutations", () => {
    const onChange = jest.fn();
    const list = watcher([1, 2] as number[], onChange);

    list.push(3);

    expect(list).toEqual([1, 2, 3]);
    expect(onChange).toHaveBeenCalled();
  });
});