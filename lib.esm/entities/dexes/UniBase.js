import { Action, } from '../../action/Action';
export class UniBase extends Action {
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
//# sourceMappingURL=UniBase.js.map