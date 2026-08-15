/**
 * @jest-environment jsdom
 */
import isIos from "@/modules/is-ios";
import isAndroid from "@/modules/is-android";

const setNavigator = (userAgent: string, maxTouchPoints: number): void => {
  Object.defineProperty(window.navigator, "userAgent", {
    value: userAgent,
    configurable: true,
  });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: maxTouchPoints,
    configurable: true,
  });
};

describe("OS detection against a live navigator", () => {
  test("should read the user agent when none is passed", () => {
    setNavigator("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", 5);
    expect(isIos()).toBe(true);
    expect(isAndroid()).toBe(false);
  });

  test("should detect Android from the live navigator", () => {
    setNavigator("Mozilla/5.0 (Linux; Android 14; Pixel 8)", 5);
    expect(isAndroid()).toBe(true);
    expect(isIos()).toBe(false);
  });

  test("should detect iPadOS 13+, which reports itself as Macintosh", () => {
    // Indistinguishable from a desktop Mac by user agent alone; touch support
    // is the only signal.
    setNavigator(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
      5
    );
    expect(isIos()).toBe(true);
  });

  test("should not mistake a desktop Mac for iPadOS", () => {
    setNavigator(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
      0
    );
    expect(isIos()).toBe(false);
  });

  test("should not apply the touch heuristic to an explicit user agent", () => {
    // A caller testing a string wants that string judged, not the live device.
    setNavigator("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5);
    expect(
      isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
    ).toBe(false);
  });
});
