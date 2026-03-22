import sleep from "@/modules/sleep";
import withRetry from "@/modules/with-retry";

jest.mock("@/modules/sleep", () => jest.fn().mockResolvedValue(undefined));

class NetworkError extends Error {}
class OtherError extends Error {}

describe("withRetry tests", () => {
  test("should return result on successful call", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const result = await withRetry({
      fn,
      retries: 3,
      delay: 100,
      exception: NetworkError,
    });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should retry on specified error type", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue("ok");

    const result = await withRetry({
      fn,
      retries: 3,
      delay: 100,
      exception: NetworkError,
    });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test("should throw immediately without retrying on different error type", async () => {
    const fn = jest.fn().mockRejectedValue(new OtherError());
    await expect(
      withRetry({ fn, retries: 3, delay: 100, exception: NetworkError }),
    ).rejects.toThrow(OtherError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should return null when all retries fail", async () => {
    const fn = jest.fn().mockRejectedValue(new NetworkError());
    const result = await withRetry({
      fn,
      retries: 3,
      delay: 100,
      exception: NetworkError,
    });
    expect(result).toBeNull();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test("should call sleep with exponential backoff", async () => {
    const fn = jest.fn().mockRejectedValue(new NetworkError());
    await withRetry({ fn, retries: 3, delay: 100, exception: NetworkError });
    expect(sleep).toHaveBeenNthCalledWith(1, 100);
    expect(sleep).toHaveBeenNthCalledWith(2, 200);
  });

  test("should not call sleep when retries is 1", async () => {
    const fn = jest.fn().mockRejectedValue(new NetworkError());
    await withRetry({ fn, retries: 1, delay: 100, exception: NetworkError });
    expect(sleep).not.toHaveBeenCalled();
  });
});
