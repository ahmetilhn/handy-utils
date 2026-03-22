import isNull from "@/modules/is-null";
import NodeEnum from "../enums/NodeEnum";

const getNode = <T extends unknown>(node: T): string => {
  if (isNull(node)) return NodeEnum.NULL;
  return Object.prototype.toString.call(node);
};

export default getNode;
