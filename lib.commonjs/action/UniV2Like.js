"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniV2Like = void 0;
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const UniBase_1 = require("../entities/dexes/UniBase");
const contracts_1 = require("../contracts");
const utils_1 = require("../base/utils");
const buffer_1 = require("buffer");
const iface = contracts_1.UniswapV2Pair__factory.createInterface();
class UniV2Like extends UniBase_1.UniBase {
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
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iface.encodeFunctionData('swap', [
            amount0.amount,
            amount1.amount,
            destination.address,
            buffer_1.Buffer.alloc(0),
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
        super(pool, direction, Action_1.DestinationOptions.Recipient, Action_1.InteractionConvention.PayBeforeCall);
        this.universe = universe;
        this.pool = pool;
        this.direction = direction;
    }
    toString() {
        return `UniV2Like(${this.inputToken.toString()}.${this.address.address}.${this.outputToken.toString()})`;
    }
}
exports.UniV2Like = UniV2Like;
//# sourceMappingURL=UniV2Like.js.map