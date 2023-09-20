"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolBalancesLendingMixin = exports.poolBalancesMetaMixin = void 0;
const curve_1 = require("../../curve");
const common_1 = require("./common");
const PoolTemplate_1 = require("../PoolTemplate");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
// @ts-ignore
exports.poolBalancesMetaMixin = {
    async statsUnderlyingBalances() {
        const swapContract = curve_1.curve.contracts[this.address].multicallContract;
        const contractCalls = this.wrappedCoins.map((_, i) => swapContract.balances(i));
        const _poolWrappedBalances = await curve_1.curve.multicallProvider.all(contractCalls);
        const [_poolMetaCoinBalance] = _poolWrappedBalances.splice(this.metaCoinIdx, 1);
        const _poolUnderlyingBalances = _poolWrappedBalances;
        const basePool = new PoolTemplate_1.PoolTemplate(this.basePool);
        const _basePoolExpectedAmounts = basePool.isMeta ?
            await common_1._calcExpectedUnderlyingAmountsMeta.call(basePool, _poolMetaCoinBalance) :
            await common_1._calcExpectedAmounts.call(basePool, _poolMetaCoinBalance);
        _poolUnderlyingBalances.splice(this.metaCoinIdx, 0, ..._basePoolExpectedAmounts);
        return _poolUnderlyingBalances.map((_b, i) => (0, units_1.formatUnits)(_b, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
exports.poolBalancesLendingMixin = {
    async statsUnderlyingBalances() {
        const swapContract = curve_1.curve.contracts[this.address].multicallContract;
        const contractCalls = this.wrappedCoins.map((_, i) => swapContract.balances(i));
        const _poolWrappedBalances = await curve_1.curve.multicallProvider.all(contractCalls);
        // @ts-ignore
        const _rates = await this._getRates();
        const _poolUnderlyingBalances = _poolWrappedBalances.map((_b, i) => _b.mul(_rates[i]).div(bignumber_1.BigNumber.from(10).pow(18)));
        return _poolUnderlyingBalances.map((_b, i) => (0, units_1.formatUnits)(_b, this.underlyingDecimals[i]));
    },
};
//# sourceMappingURL=poolBalancesMixin.js.map