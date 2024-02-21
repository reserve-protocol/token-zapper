"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniBase = void 0;
const Action_1 = require("../../action/Action");
class UniBase extends Action_1.Action {
    direction;
    destination;
    interactionConvention;
    zeroForOne;
    outputToken;
    inputToken;
    constructor(basePool, direction, destination, interactionConvention) {
        super(basePool.address, [direction === '0->1' ? basePool.token0 : basePool.token1], [direction === '0->1' ? basePool.token1 : basePool.token0], interactionConvention, destination, []);
        this.direction = direction;
        this.destination = destination;
        this.interactionConvention = interactionConvention;
        this.zeroForOne = direction === '0->1';
        this.outputToken = this.zeroForOne ? basePool.token1 : basePool.token0;
        this.inputToken = this.zeroForOne ? basePool.token0 : basePool.token1;
    }
}
exports.UniBase = UniBase;
//# sourceMappingURL=UniBase.js.map