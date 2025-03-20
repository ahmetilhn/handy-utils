import isClient from "./is-client";

const isServer = (): boolean => {
  return !isClient();
};

export default isServer;
