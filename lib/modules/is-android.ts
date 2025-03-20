import isClient from "@/modules/is-client";

const isAndroid = (): boolean => {
  if (!isClient()) throw new Error("Os detecetor only works on client!");
  return !!/Android/i.exec(navigator.userAgent);
};

export default isAndroid;
