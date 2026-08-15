import isClient from "./is-client";

const ANDROID_PATTERN = /Android/i;

/**
 * Pass a user agent to test it directly, or omit it to read
 * `navigator.userAgent` in the browser.
 */
const isAndroid = (userAgent?: string): boolean => {
  // `?? ` rather than a truthiness check: an empty string is still a supplied
  // user agent, and used to fall through and throw on the server.
  const agent = userAgent ?? (isClient() ? navigator.userAgent : undefined);

  if (agent === undefined) {
    throw new Error(
      "OS detection needs a user agent: pass one, or call this on the client."
    );
  }

  return ANDROID_PATTERN.test(agent);
};

export default isAndroid;
