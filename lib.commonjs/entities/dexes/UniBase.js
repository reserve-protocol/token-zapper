"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniBase = void 0;
const Action_1 = require("../../action/Action");
class UniBase extends (0, Action_1.Action)('UniV2-Like') {
    direction;
    destination;
    zeroForOne;
    output;
    input;
    constructor(basePool, direction, destination, interactionConvention) {
        super(basePool.address, [direction === '0->1' ? basePool.token0 : basePool.token1], [direction === '0->1' ? basePool.token1 : basePool.token0], interactionConvention, destination, []);
        this.direction = direction;
        this.destination = destination;
        this.zeroForOne = direction === '0->1';
        this.output = this.zeroForOne ? basePool.token1 : basePool.token0;
        this.input = this.zeroForOne ? basePool.token0 : basePool.token1;
    }
}
exports.UniBase = UniBase;
//# sourceMappingURL=UniBase.js.map