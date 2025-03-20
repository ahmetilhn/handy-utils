describe("isServer tests", () => {
  test("it should return true", () => {
    jest.mock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => false,
    }));
    const isServer = require("@/modules/is-server").default;
    expect(isServer()).toBeTruthy();
  });
  test("it should return false", () => {
    jest.mock("@/modules/is-client", () => ({
      __esModule: true,
      default: () => true,
    }));
    const isServer = require("@/modules/is-server").default;
    expect(isServer()).toBeFalsy();
  });
});
