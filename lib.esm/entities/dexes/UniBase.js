import { Action, } from '../../action/Action';
export class UniBase extends Action('UniV2-Like') {
    direction;
    destination;
    interactionConvention;
    zeroForOne;
    output;
    input;
    constructor(basePool, direction, destination, interactionConvention) {
        super(basePool.address, [direction === '0->1' ? basePool.token0 : basePool.token1], [direction === '0->1' ? basePool.token1 : basePool.token0], interactionConvention, destination, []);
        this.direction = direction;
        this.destination = destination;
        this.interactionConvention = interactionConvention;
        this.zeroForOne = direction === '0->1';
        this.output = this.zeroForOne ? basePool.token1 : basePool.token0;
        this.input = this.zeroForOne ? basePool.token0 : basePool.token1;
    }
}
//# sourceMappingURL=UniBase.js.map