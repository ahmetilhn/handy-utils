import isClient from "./is-client";

const isIos = (): boolean => {
  if (!isClient()) throw new Error("Os detecetor only works on client!");
  return !!/iPhone|iPad|iPod/i.exec(navigator.userAgent);
};

export default isIos;
