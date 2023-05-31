import { DestinationOptions, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { UniBase } from '../entities/dexes/UniBase';
import { UniswapV2Pair__factory } from '../contracts';
import { parseHexStringIntoBuffer } from '../base/utils';
import { Buffer } from 'buffer';
const iface = UniswapV2Pair__factory.createInterface();
export class UniV2Like extends UniBase {
    universe;
    pool;
    direction;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode(amountsIn, destination) {
        const amountOut = await this.pool.swapFn(amountsIn[0], this);
        const [amount0, amount1] = amountsIn[0].token === this.pool.token0
            ? [amountsIn[0], amountOut]
            : [amountOut, amountsIn[0]];
        return new ContractCall(parseHexStringIntoBuffer(iface.encodeFunctionData('swap', [
            amount0.amount,
            amount1.amount,
            destination.address,
            Buffer.alloc(0),
        ])), this.pool.address, 0n, this.gasEstimate(), 'V2Swap ' + this.pool.name);
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