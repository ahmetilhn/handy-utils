type AnyFunction = (...args: any[]) => any;

type DebounceOptions = {
  /** Invoke on the leading edge of the window. */
  leading?: boolean;
  /** Invoke on the trailing edge of the window. */
  trailing?: boolean;
  /** Upper bound in ms on how long an invocation can be deferred. */
  maxWait?: number;
};

type Debounced<T extends AnyFunction> = {
  (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined;
  /** Discard the pending call, if any. */
  cancel: () => void;
  /** Run the pending call now and return its result. */
  flush: () => ReturnType<T> | undefined;
  /** Whether a call is currently waiting to run. */
  pending: () => boolean;
};

const debounce = <T extends AnyFunction>(
  fn: T,
  wait: number,
  { leading = false, trailing = true, maxWait }: DebounceOptions = {}
): Debounced<T> => {
  // Negative and NaN waits collapse to 0 instead of letting setTimeout guess.
  const delay = wait > 0 ? wait : 0;
  const hasMaxWait = maxWait !== undefined;
  // A maxWait shorter than wait would fire before the window it bounds.
  const maxDelay = hasMaxWait ? Math.max(maxWait, delay) : 0;

  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: ThisParameterType<T>;
  let result: ReturnType<T> | undefined;
  /** When the wrapper was last called. */
  let lastCallTime: number | undefined;
  /** When `fn` last actually ran. */
  let lastInvokeTime = 0;

  const invoke = (time: number): ReturnType<T> | undefined => {
    const args = lastArgs as Parameters<T>;
    const thisArg = lastThis;
    // Cleared before the call so a re-entrant call from `fn` starts a fresh window instead of
    // replaying these arguments on the trailing edge.
    lastArgs = undefined;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args);
    return result;
  };

  const shouldInvoke = (time: number): boolean => {
    if (lastCallTime === undefined) return true;
    const sinceCall = time - lastCallTime;
    // `sinceCall < 0` means the system clock moved backwards; treat it as a fresh window rather
    // than waiting out a negative interval.
    return (
      sinceCall >= delay ||
      sinceCall < 0 ||
      (hasMaxWait && time - lastInvokeTime >= maxDelay)
    );
  };

  const remainingWait = (time: number): number => {
    const untilTrailing = delay - (time - (lastCallTime as number));
    return hasMaxWait
      ? Math.min(untilTrailing, maxDelay - (time - lastInvokeTime))
      : untilTrailing;
  };

  const onTimerExpired = (): void => {
    const time = Date.now();
    if (!shouldInvoke(time)) {
      // A call landed after this timer was scheduled, so the window moved.
      timer = setTimeout(onTimerExpired, remainingWait(time));
      return;
    }
    timer = undefined;
    // No `lastArgs` means the leading edge already consumed the only call.
    if (trailing && lastArgs) invoke(time);
    else lastArgs = undefined;
  };

  const debounced = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timer === undefined) {
        lastInvokeTime = time;
        timer = setTimeout(onTimerExpired, delay);
        return leading ? invoke(time) : result;
      }
      if (hasMaxWait) {
        // maxWait elapsed inside a busy stream of calls — the pending timer has not run yet, so it
        // has to be dropped before the next window is armed or it…
        clearTimeout(timer);
        timer = setTimeout(onTimerExpired, delay);
        return invoke(time);
      }
    }
    if (timer === undefined) timer = setTimeout(onTimerExpired, delay);
    return result;
  };

  debounced.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
    lastCallTime = undefined;
    lastInvokeTime = 0;
  };

  debounced.flush = (): ReturnType<T> | undefined => {
    if (timer === undefined) return result;
    clearTimeout(timer);
    timer = undefined;
    if (trailing && lastArgs) return invoke(Date.now());
    lastArgs = undefined;
    return result;
  };

  debounced.pending = (): boolean => timer !== undefined;

  return debounced;
};

export type { DebounceOptions, Debounced };
export default debounce;
