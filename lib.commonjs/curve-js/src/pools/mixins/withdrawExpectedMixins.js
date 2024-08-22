"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawWrappedExpectedMixin = exports.withdrawExpectedMetaMixin = exports.withdrawExpectedLendingOrCryptoMixin = exports.withdrawExpectedMixin = void 0;
const utils_1 = require("../../utils");
const common_1 = require("./common");
const units_1 = require("@ethersproject/units");
// @ts-ignore
exports.withdrawExpectedMixin = {
    async withdrawExpected(lpTokenAmount) {
        const _lpTokenAmount = (0, utils_1.parseUnits)(lpTokenAmount);
        const _expected = await common_1._calcExpectedAmounts.call(this, _lpTokenAmount);
        return _expected.map((amount, i) => (0, units_1.formatUnits)(amount, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
exports.withdrawExpectedLendingOrCryptoMixin = {
    async withdrawExpected(lpTokenAmount) {
        const _lpTokenAmount = (0, utils_1.parseUnits)(lpTokenAmount);
        const _expectedAmounts = await common_1._calcExpectedAmounts.call(this, _lpTokenAmount);
        // @ts-ignore
        const _rates = await this._getRates();
        const _expected = _expectedAmounts.map((_amount, i) => _amount.toBigInt() * _rates[i] / (10n ** 18n));
        return _expected.map((amount, i) => (0, units_1.formatUnits)(amount, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
exports.withdrawExpectedMetaMixin = {
    async withdrawExpected(lpTokenAmount) {
        const _lpTokenAmount = (0, utils_1.parseUnits)(lpTokenAmount);
        const _expected = await common_1._calcExpectedUnderlyingAmountsMeta.call(this, _lpTokenAmount);
        return _expected.map((amount, i) => (0, units_1.formatUnits)(amount, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
exports.withdrawWrappedExpectedMixin = {
    async withdrawWrappedExpected(lpTokenAmount) {
        const _lpTokenAmount = (0, utils_1.parseUnits)(lpTokenAmount);
        const _expected = await common_1._calcExpectedAmounts.call(this, _lpTokenAmount);
        return _expected.map((amount, i) => (0, units_1.formatUnits)(amount, this.wrappedDecimals[i]));
    },
};
//# sourceMappingURL=withdrawExpectedMixins.js.map