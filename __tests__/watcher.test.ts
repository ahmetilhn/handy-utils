import watcher from "@/modules/watcher";

describe("watcher tests", () => {
  it("değer değiştiğinde onChange tetiklenir", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 0 }, onChange);

    state.count = 1;

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("count", 1, 0);
  });

  it("aynı değer atanırsa onChange tetiklenmez", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 0 }, onChange);

    state.count = 0;

    expect(onChange).not.toHaveBeenCalled();
  });

  it("birden fazla alan izlenebilir", () => {
    const onChange = jest.fn();
    const state = watcher({ count: 0, name: "Ahmet" }, onChange);

    state.count = 5;
    state.name = "Mehmet";

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, "count", 5, 0);
    expect(onChange).toHaveBeenNthCalledWith(2, "name", "Mehmet", "Ahmet");
  });

  it("NaN === NaN atamasında onChange tetiklenmez", () => {
    const onChange = jest.fn();
    const state = watcher({ value: NaN }, onChange);

    state.value = NaN;

    expect(onChange).not.toHaveBeenCalled();
  });

  it("undefined'dan değere geçişte önceki değer undefined gelir", () => {
    const onChange = jest.fn();
    const state = watcher({ label: undefined as string | undefined }, onChange);

    state.label = "test";

    expect(onChange).toHaveBeenCalledWith("label", "test", undefined);
  });

  it("proxy orijinal nesneyi mutate eder", () => {
    const original = { count: 0 };
    const state = watcher(original, jest.fn());

    state.count = 42;

    expect(original.count).toBe(42);
  });
});