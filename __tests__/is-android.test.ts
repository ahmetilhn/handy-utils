describe("isAndroid tests", () => {
  beforeEach(() => {
    jest.doMock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => true,
    }));
  });
  test("it should return true when user agent is contains android", () => {
    const isAndroid = require("@/modules/is-android").default;
    Object.defineProperty(global.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Linux; Android <version>; <device_model> Build/<build_version>) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<chrome_version> Mobile Safari/537.36",
      configurable: true,
    });
    expect(isAndroid()).toBeTruthy();
  });
  test("it should return false when user agent is container ios", () => {
    const isAndroid = require("@/modules/is-android").default;

    Object.defineProperty(global.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36",
      configurable: true,
    });
    expect(isAndroid()).toBeFalsy();
  });
  test("it should throw error on use it on server", () => {
    jest.doMock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => false,
    }));
    const isAndroid = require("@/modules/is-android").default;

    expect(() => isAndroid()).toThrow();
  });
  test("it should return true when got userAgent param", () => {
    const isAndroid = require("@/modules/is-android").default;
    expect(
      isAndroid(
        "Mozilla/5.0 (Linux; Android <version>; <device_model> Build/<build_version>) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<chrome_version> Mobile Safari/537.36"
      )
    ).toBeTruthy();
  });
});

describe("isAndroid explicit user agent", () => {
  test("should treat an empty user agent as a supplied value, not as absent", () => {
    // A truthiness check used to let "" fall through to the client lookup,
    // which then threw on the server.
    jest.doMock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => false,
    }));
    const isAndroid = require("@/modules/is-android").default;

    expect(isAndroid("")).toBe(false);
  });

  test("should work on the server whenever a user agent is given", () => {
    jest.doMock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => false,
    }));
    const isAndroid = require("@/modules/is-android").default;

    expect(isAndroid("Mozilla/5.0 (Linux; Android 14)")).toBe(true);
    expect(isAndroid("Mozilla/5.0 (iPhone)")).toBe(false);
  });
});
