describe("isIos tests", () => {
  beforeEach(() => {
    jest.doMock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => true,
    }));
  });
  test("it should return true when user agent contains ios", () => {
    Object.defineProperty(global.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36",
      configurable: true,
    });
    const isIos = require("@/modules/is-ios").default;
    expect(isIos()).toBeTruthy();
  });

  test("it should return false when don't contains ios", () => {
    Object.defineProperty(global.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Linux; Android <version>; <device_model> Build/<build_version>) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<chrome_version> Mobile Safari/537.36",
      configurable: true,
    });
    const isIos = require("@/modules/is-ios").default;
    expect(isIos()).toBeFalsy();
  });

  test("it should throw error when use it on server", () => {
    jest.doMock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => false,
    }));
    const isIos = require("@/modules/is-ios").default;
    expect(() => isIos()).toThrow();
  });
  test("it should return true when got userAgent param", () => {
    const isIos = require("@/modules/is-ios").default;
    expect(
      isIos(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36"
      )
    ).toBeTruthy();
  });
});
