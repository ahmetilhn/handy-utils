import sleep from "./sleep";

type Props<T> = {
  fn: () => Promise<T>;
  retries: number;
  delay: number;
  exception: new (...args: any[]) => Error;
};

const withRetry = async <T>({
  fn,
  retries,
  delay,
  exception,
}: Props<T>): Promise<T | null> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!(err instanceof exception)) throw err;
      if (i === retries - 1) return null;
      await sleep(delay * 2 ** i);
    }
  }
  return null;
};

export default withRetry;
