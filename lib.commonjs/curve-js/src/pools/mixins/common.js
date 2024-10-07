"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._calcExpectedUnderlyingAmountsMeta = exports._calcExpectedAmounts = void 0;
const PoolTemplate_1 = require("../PoolTemplate");
const curve_1 = require("../../curve");
const utils_1 = require("../../utils");
async function _calcExpectedAmounts(_lpTokenAmount) {
    const coinBalancesBN = [];
    for (let i = 0; i < this.wrappedCoinAddresses.length; i++) {
        const _balance = await curve_1.curve.contracts[this.address].contract.balances(i, curve_1.curve.constantOptions);
        coinBalancesBN.push((0, utils_1.toBN)(_balance, this.wrappedDecimals[i]));
    }
    const totalSupplyBN = (0, utils_1.toBN)(await curve_1.curve.contracts[this.lpToken].contract.totalSupply(curve_1.curve.constantOptions));
    const expectedAmountsBN = [];
    for (const coinBalance of coinBalancesBN) {
        expectedAmountsBN.push(coinBalance.times((0, utils_1.toBN)(_lpTokenAmount)).div(totalSupplyBN));
    }
    return expectedAmountsBN.map((amount, i) => (0, utils_1.fromBN)(amount, this.wrappedDecimals[i]));
}
exports._calcExpectedAmounts = _calcExpectedAmounts;
async function _calcExpectedUnderlyingAmountsMeta(_lpTokenAmount) {
    const _expectedWrappedAmounts = await _calcExpectedAmounts.call(this, _lpTokenAmount);
    const [_expectedMetaCoinAmount] = _expectedWrappedAmounts.splice(this.metaCoinIdx, 1);
    const _expectedUnderlyingAmounts = _expectedWrappedAmounts;
    const basePool = new PoolTemplate_1.PoolTemplate(this.basePool);
    const _basePoolExpectedAmounts = basePool.isMeta ?
        await _calcExpectedUnderlyingAmountsMeta.call(basePool, _expectedMetaCoinAmount) :
        await _calcExpectedAmounts.call(basePool, _expectedMetaCoinAmount);
    _expectedUnderlyingAmounts.splice(this.metaCoinIdx, 0, ..._basePoolExpectedAmounts);
    return _expectedUnderlyingAmounts;
}
exports._calcExpectedUnderlyingAmountsMeta = _calcExpectedUnderlyingAmountsMeta;
//# sourceMappingURL=common.js.map