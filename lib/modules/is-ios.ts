import isClient from "./is-client";

const IOS_PATTERN = /iPhone|iPad|iPod/i;
const MAC_PATTERN = /Macintosh/i;

/**
 * Pass a user agent to test it directly, or omit it to read
 * `navigator.userAgent` in the browser.
 */
const isIos = (userAgent?: string): boolean => {
  // `?? ` rather than a truthiness check: an empty string is still a supplied
  // user agent, and used to fall through and throw on the server.
  const agent = userAgent ?? (isClient() ? navigator.userAgent : undefined);

  if (agent === undefined) {
    throw new Error(
      "OS detection needs a user agent: pass one, or call this on the client."
    );
  }

  if (IOS_PATTERN.test(agent)) return true;

  // iPadOS 13+ reports itself as "Macintosh". The only way to tell it from a
  // desktop Mac is the touch support, which is not in the user agent — so this
  // is detectable when reading the live navigator, but not from a string.
  return (
    userAgent === undefined &&
    isClient() &&
    MAC_PATTERN.test(agent) &&
    navigator.maxTouchPoints > 1
  );
};

export default isIos;
