"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniV2Like = void 0;
const Action_1 = require("./Action");
const UniBase_1 = require("../entities/dexes/UniBase");
const UniswapV2Pair__factory_1 = require("../contracts/factories/contracts/UniswapV2Pair__factory");
const iface = UniswapV2Pair__factory_1.UniswapV2Pair__factory.createInterface();
class UniV2Like extends UniBase_1.UniBase {
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
        super(pool, direction, Action_1.DestinationOptions.Recipient, Action_1.InteractionConvention.PayBeforeCall);
        this.universe = universe;
        this.pool = pool;
        this.direction = direction;
    }
    toString() {
        return `UniV2Like(${this.input.symbol.toString()}.${this.address.address}.${this.output.symbol.toString()})`;
    }
}
exports.UniV2Like = UniV2Like;
//# sourceMappingURL=UniV2Like.js.map