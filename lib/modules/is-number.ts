import NodeEnum from "../enums/NodeEnum";
import getNode from "../helpers/node.helper";

/**
 * Finite numbers only. `NaN` was already excluded, so letting `Infinity`
 * through was inconsistent: neither is a value you can compute with.
 */
const isNumber = (val: unknown): val is number => {
  return (
    typeof val === "number" &&
    Number.isFinite(val) &&
    getNode(val) === NodeEnum.NUMBER
  );
};

export default isNumber;
