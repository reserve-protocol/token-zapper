import { parseUnits } from "../../utils";
import { _calcExpectedAmounts, _calcExpectedUnderlyingAmountsMeta } from "./common";
import { formatUnits } from "@ethersproject/units";
// @ts-ignore
export const withdrawExpectedMixin = {
    async withdrawExpected(lpTokenAmount) {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await _calcExpectedAmounts.call(this, _lpTokenAmount);
        return _expected.map((amount, i) => formatUnits(amount, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
export const withdrawExpectedLendingOrCryptoMixin = {
    async withdrawExpected(lpTokenAmount) {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expectedAmounts = await _calcExpectedAmounts.call(this, _lpTokenAmount);
        // @ts-ignore
        const _rates = await this._getRates();
        const _expected = _expectedAmounts.map((_amount, i) => _amount.toBigInt() * _rates[i] / (10n ** 18n));
        return _expected.map((amount, i) => formatUnits(amount, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
export const withdrawExpectedMetaMixin = {
    async withdrawExpected(lpTokenAmount) {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await _calcExpectedUnderlyingAmountsMeta.call(this, _lpTokenAmount);
        return _expected.map((amount, i) => formatUnits(amount, this.underlyingDecimals[i]));
    },
};
// @ts-ignore
export const withdrawWrappedExpectedMixin = {
    async withdrawWrappedExpected(lpTokenAmount) {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await _calcExpectedAmounts.call(this, _lpTokenAmount);
        return _expected.map((amount, i) => formatUnits(amount, this.wrappedDecimals[i]));
    },
};
//# sourceMappingURL=withdrawExpectedMixins.js.map