"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2Pool = exports.standardEncoding = exports.standardSwap = void 0;
const Address_1 = require("../../base/Address");
const constants_1 = require("../../base/constants");
const keccak256_1 = require("@ethersproject/keccak256");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../base/utils");
const buffer_1 = require("buffer");
const UniswapV2Pair__factory_1 = require("../../contracts/factories/UniswapV2Pair__factory");
const INIT_CODE_HASH = (0, utils_1.parseHexStringIntoBuffer)('0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f');
const sortTokens = (tokenA, tokenB) => {
    return tokenA.address.gt(tokenB.address) ? [tokenB, tokenA] : [tokenA, tokenB];
};
const computeV2PoolAddress = (factory, token0, token1) => {
    const salt = buffer_1.Buffer.concat([token0.address.bytes, token1.address.bytes]);
    return Address_1.Address.from((0, address_1.getCreate2Address)(factory.address, (0, keccak256_1.keccak256)(salt), INIT_CODE_HASH));
};
function getAmountOut(amountIn, feeInverse, rin, rout) {
    const amountInWithFee = amountIn * feeInverse;
    const numerator = amountInWithFee * rout;
    const denominator = rin * constants_1.FEE_SCALE + amountInWithFee;
    return numerator / denominator;
}
function getAmountIn(amountOut, feeInverse, reserveIn, reserveOut) {
    const numerator = reserveIn * amountOut * constants_1.FEE_SCALE;
    const denominator = (reserveOut - amountOut) * feeInverse;
    return numerator / denominator + 1n;
}
const standardSwap = async (inputQty, action) => {
    if (action.direction === '0->1') {
        if (inputQty.token === action.pool.token0) {
            return action.pool.token1.fromBigInt(getAmountOut(inputQty.amount, action.pool.feeInv, action.pool.reserve0, action.pool.reserve1));
        }
        else {
            return action.pool.token0.fromBigInt(getAmountIn(inputQty.amount, action.pool.feeInv, action.pool.reserve0, action.pool.reserve1));
        }
    }
    else if (action.direction === '1->0') {
        if (inputQty.token === action.pool.token1) {
            return action.pool.token0.fromBigInt(getAmountOut(inputQty.amount, action.pool.feeInv, action.pool.reserve1, action.pool.reserve0));
        }
        else {
            return action.pool.token1.fromBigInt(getAmountIn(inputQty.amount, action.pool.feeInv, action.pool.reserve1, action.pool.reserve0));
        }
    }
    else {
        throw new Error('Invalid direction ' + action.direction);
    }
};
exports.standardSwap = standardSwap;
const standardPoolIface = UniswapV2Pair__factory_1.UniswapV2Pair__factory.createInterface();
const standardEncoding = async (inputQty, to, action) => {
    let amount0 = 0n;
    let amount1 = 0n;
    if (action.direction === '0->1') {
        if (inputQty.token === action.pool.token0) {
            amount1 = getAmountOut(inputQty.amount, action.pool.feeInv, action.pool.reserve0, action.pool.reserve1);
        }
        else {
            amount0 = getAmountIn(inputQty.amount, action.pool.feeInv, action.pool.reserve0, action.pool.reserve1);
        }
    }
    else if (action.direction === '1->0') {
        if (inputQty.token === action.pool.token1) {
            amount0 = getAmountOut(inputQty.amount, action.pool.feeInv, action.pool.reserve1, action.pool.reserve0);
        }
        else {
            amount1 = getAmountIn(inputQty.amount, action.pool.feeInv, action.pool.reserve1, action.pool.reserve0);
        }
    }
    else {
        throw new Error('Invalid direction ' + action.direction);
    }
    return buffer_1.Buffer.from(standardPoolIface
        .encodeFunctionData('swap', [
        amount0,
        amount1,
        to.address,
        buffer_1.Buffer.alloc(0),
    ])
        .slice(2), 'hex');
};
exports.standardEncoding = standardEncoding;
class V2Pool {
    address;
    token0;
    token1;
    reserve0_;
    reserve1_;
    _fee;
    swapFn;
    encodeSwap;
    _feeInv = 0n;
    get fee() {
        return this._fee;
    }
    get feeInv() {
        return this._feeInv;
    }
    get name() {
        return `V2.${this.address.address.slice(0, 6)}..${this.address.address.slice(38)}.${this.token0}.${this.token1}`;
    }
    toString() {
        return `V2Pool(${this.name},reserve0=${this.token0.fromBigInt(this.reserve0_)},reserve1=${this.token1.fromBigInt(this.reserve1_)})`;
    }
    constructor(address, token0, token1, reserve0_, reserve1_, _fee, swapFn, encodeSwap) {
        this.address = address;
        this.token0 = token0;
        this.token1 = token1;
        this.reserve0_ = reserve0_;
        this.reserve1_ = reserve1_;
        this._fee = _fee;
        this.swapFn = swapFn;
        this.encodeSwap = encodeSwap;
        this._feeInv = constants_1.FEE_SCALE - _fee;
    }
    get reserve0() {
        return this.reserve0_;
    }
    get reserve1() {
        return this.reserve1_;
    }
    updateReserves(reserve0, reserve1) {
        this.reserve0_ = reserve0;
        this.reserve1_ = reserve1;
    }
    static createStandardV2Pool(factory, tokenA, tokenB, fee, poolAddress) {
        if (tokenA === tokenB) {
            throw new Error('Invalid pool input');
        }
        const [token0, token1] = sortTokens(tokenA, tokenB);
        poolAddress =
            poolAddress == null
                ? computeV2PoolAddress(factory, token0, token1)
                : poolAddress;
        return new V2Pool(poolAddress, token0, token1, 0n, 0n, fee, exports.standardSwap, exports.standardEncoding);
    }
}
exports.V2Pool = V2Pool;
//# sourceMappingURL=V2LikePool.js.map