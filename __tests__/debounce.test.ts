import debounce from "@/modules/debounce";

describe("debounce tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should not invoke before the wait elapses", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should collapse a burst into a single trailing call with the last arguments", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    jest.advanceTimersByTime(50);
    debounced("b");
    jest.advanceTimersByTime(50);
    debounced("c");
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  test("should re-arm instead of invoking when a call lands mid-window", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(50);
    debounced();

    // The first timer fires here, but the window moved 50ms forward.
    jest.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should start a new window after the trailing call", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    jest.advanceTimersByTime(100);
    debounced("second");
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, "second");
  });

  test("should invoke immediately with leading and skip the trailing call", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { leading: true });

    debounced("a");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");

    // A single call has nothing left to replay on the trailing edge.
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should invoke on both edges of a burst when leading is enabled", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { leading: true });

    debounced("a");
    debounced("b");
    debounced("c");
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, "c");
  });

  test("should invoke only once per window with trailing disabled", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { leading: true, trailing: false });

    debounced("a");
    debounced("b");
    jest.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  test("should never invoke when both edges are disabled", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { leading: false, trailing: false });

    debounced();
    jest.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();
  });

  test("should invoke at maxWait while calls keep arriving", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { maxWait: 250 });

    // A call every 50ms never lets the 100ms window close on its own, so
    // without maxWait this stream would starve the function.
    for (let i = 0; i < 4; i++) {
      debounced(i);
      jest.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
    }

    debounced(4);
    jest.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(4);
  });

  test("should invoke on call when the maxWait deadline passed unattended", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { maxWait: 250 });

    debounced("a");
    jest.advanceTimersByTime(50);
    debounced("b");
    // A blocked event loop: the clock is past the deadline but the pending
    // timer has not run, so the next call has to invoke by itself.
    jest.setSystemTime(Date.now() + 300);
    debounced("c");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");

    // The timer that was pending must not fire on top of that invocation.
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should clamp a maxWait shorter than the wait", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { maxWait: 10 });

    debounced();
    jest.advanceTimersByTime(50);
    debounced();
    // With maxWait honoured literally this would have fired at 10ms.
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should cut the re-armed timer short at maxWait", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { maxWait: 120 });

    debounced();
    jest.advanceTimersByTime(50);
    debounced();

    // The trailing edge alone would land at 150ms; maxWait pulls it to 120ms.
    jest.advanceTimersByTime(69);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should keep waiting when the window elapsed during a stall", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    // The event loop was blocked past the window; the timer is still pending.
    jest.setSystemTime(Date.now() + 300);
    debounced("b");
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });

  test("should treat a backwards clock jump as a fresh window", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { maxWait: 500 });

    debounced("a");
    jest.setSystemTime(Date.now() - 10_000);
    debounced("b");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });

  test("should schedule on the next tick when wait is not positive", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, -50);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("cancel should drop the pending call", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(debounced.pending()).toBe(true);

    debounced.cancel();
    expect(debounced.pending()).toBe(false);

    jest.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  test("cancel should be a no-op when nothing is pending", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    expect(() => debounced.cancel()).not.toThrow();
    expect(debounced.pending()).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  test("cancel should leave the next call to start a clean window", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, { leading: true });

    debounced("a");
    debounced.cancel();
    debounced("b");

    // The leading edge fires again because cancel cleared the window.
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, "b");
  });

  test("flush should invoke the pending call immediately", () => {
    const fn = jest.fn((value: number) => value * 2);
    const debounced = debounce(fn, 100);

    debounced(21);
    expect(debounced.flush()).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(debounced.pending()).toBe(false);

    // The flushed timer must not fire a second time.
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("flush should return the last result when nothing is pending", () => {
    const fn = jest.fn((value: number) => value * 2);
    const debounced = debounce(fn, 100);

    expect(debounced.flush()).toBeUndefined();

    debounced(5);
    jest.advanceTimersByTime(100);

    expect(debounced.flush()).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("flush should drop the pending call when trailing is disabled", () => {
    const fn = jest.fn((value: number) => value * 2);
    const debounced = debounce(fn, 100, { leading: true, trailing: false });

    debounced(3);
    expect(debounced.flush()).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(debounced.pending()).toBe(false);
  });

  test("flush should not replay a call the leading edge already made", () => {
    const fn = jest.fn((value: number) => value * 2);
    const debounced = debounce(fn, 100, { leading: true });

    debounced(4);
    expect(debounced.flush()).toBe(8);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should schedule a trailing call made shortly after a flush", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced.flush();
    debounced("b");

    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, "b");
  });

  test("should return the cached result between invocations", () => {
    const fn = jest.fn((value: number) => value * 2);
    const debounced = debounce(fn, 100, { leading: true });

    expect(debounced(1)).toBe(2);
    // Subsequent calls in the same window report the last known result.
    expect(debounced(9)).toBe(2);

    jest.advanceTimersByTime(100);
    expect(debounced(3)).toBe(6);
  });

  test("should preserve the receiver and the arguments", () => {
    const calls: unknown[][] = [];
    const counter = {
      step: 5,
      add: debounce(function (this: { step: number }, a: number, b: number) {
        calls.push([this.step, a, b]);
      }, 100),
    };

    counter.add(1, 2);
    jest.advanceTimersByTime(100);

    expect(calls).toEqual([[5, 1, 2]]);
  });

  test("should start a fresh window for a re-entrant call", () => {
    const seen: string[] = [];
    const fn = jest.fn((label: string): void => {
      seen.push(label);
      if (seen.length === 1) debounced("inner");
    });
    const debounced = debounce(fn, 100);

    debounced("outer");
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    // The call made from inside `fn` is debounced like any other.
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, "inner");
  });

  test("should keep separate state per debounced wrapper", () => {
    const first = jest.fn();
    const second = jest.fn();
    const debouncedFirst = debounce(first, 100);
    const debouncedSecond = debounce(second, 100);

    debouncedFirst();
    debouncedSecond();
    debouncedFirst.cancel();
    jest.advanceTimersByTime(100);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
