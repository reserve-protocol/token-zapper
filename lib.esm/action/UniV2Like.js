import { DestinationOptions, InteractionConvention } from './Action';
import { UniBase } from '../entities/dexes/UniBase';
import { UniswapV2Pair__factory } from '../contracts/factories/contracts/UniswapV2Pair__factory';
const iface = UniswapV2Pair__factory.createInterface();
export class UniV2Like extends UniBase {
    universe;
    pool;
    direction;
    async plan(planner, inputs, _) {
        throw new Error('Method not implemented.');
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    /**
     * @node V2Actions can quote in both directions!
     * @returns
     */
    async quote([amountsIn]) {
        return [await this.pool.swapFn(amountsIn, this)];
    }
    constructor(universe, pool, direction) {
        super(pool, direction, DestinationOptions.Recipient, InteractionConvention.PayBeforeCall);
        this.universe = universe;
        this.pool = pool;
        this.direction = direction;
    }
    toString() {
        return `UniV2Like(${this.inputToken.symbol.toString()}.${this.address.address}.${this.outputToken.symbol.toString()})`;
    }
}
//# sourceMappingURL=UniV2Like.js.map