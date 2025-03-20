describe("isClient tests", () => {
  test("it should return false", () => {
    jest.doMock("@/modules/is-defined", () => ({
      __esModule: true,
      default: () => false,
    }));
    const isClient = require("@/modules/is-client").default;
    expect(isClient()).toBeFalsy();
  });
  test("it should return true", () => {
    jest.doMock("@/modules/is-defined", () => ({
      __esModule: true,
      default: () => true,
    }));
    const isClient = require("@/modules/is-client").default;
    expect(isClient()).toBeTruthy();
  });
});
