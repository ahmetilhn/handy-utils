import sleep from "@/modules/sleep";
import withRetry from "@/modules/with-retry";

jest.mock("@/modules/sleep", () => jest.fn().mockResolvedValue(undefined));

class NetworkError extends Error {}
class OtherError extends Error {}

describe("withRetry tests", () => {
  it("başarılı çağrıda sonucu döner", async () => {
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

  it("belirtilen hata türünde retry yapar", async () => {
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

  it("farklı hata türünde retry yapmadan fırlatır", async () => {
    const fn = jest.fn().mockRejectedValue(new OtherError());
    await expect(
      withRetry({ fn, retries: 3, delay: 100, exception: NetworkError }),
    ).rejects.toThrow(OtherError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("tüm denemeler başarısız olursa null döner", async () => {
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

  it("exponential backoff ile sleep çağrılır", async () => {
    const fn = jest.fn().mockRejectedValue(new NetworkError());
    await withRetry({ fn, retries: 3, delay: 100, exception: NetworkError });
    expect(sleep).toHaveBeenNthCalledWith(1, 100);
    expect(sleep).toHaveBeenNthCalledWith(2, 200);
  });

  it("retries=1 ise sleep çağrılmaz", async () => {
    const fn = jest.fn().mockRejectedValue(new NetworkError());
    await withRetry({ fn, retries: 1, delay: 100, exception: NetworkError });
    expect(sleep).not.toHaveBeenCalled();
  });
});
