import { type PoolTemplate } from "../PoolTemplate";
import { parseUnits } from "../../utils";
import { _calcExpectedAmounts, _calcExpectedUnderlyingAmountsMeta } from "./common";
import { formatUnits } from "@ethersproject/units"

// @ts-ignore
export const withdrawExpectedMixin: PoolTemplate = {
    async withdrawExpected(lpTokenAmount: number | string): Promise<string[]> {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await _calcExpectedAmounts.call(this, _lpTokenAmount);

        return _expected.map((amount, i: number) => formatUnits(amount, this.underlyingDecimals[i]));
    },
}

// @ts-ignore
export const withdrawExpectedLendingOrCryptoMixin: PoolTemplate = {
    async withdrawExpected(lpTokenAmount: number | string): Promise<string[]> {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expectedAmounts = await _calcExpectedAmounts.call(this, _lpTokenAmount);
        // @ts-ignore
        const _rates: bigint[] = await this._getRates();
        const _expected = _expectedAmounts.map((_amount, i: number) => _amount.toBigInt() * _rates[i] / (10n ** 18n))

        return _expected.map((amount, i: number) => formatUnits(amount, this.underlyingDecimals[i]));
    },
}

// @ts-ignore
export const withdrawExpectedMetaMixin: PoolTemplate = {
    async withdrawExpected(lpTokenAmount: number | string): Promise<string[]> {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await _calcExpectedUnderlyingAmountsMeta.call(this, _lpTokenAmount)

        return _expected.map((amount, i: number) => formatUnits(amount, this.underlyingDecimals[i]));
    },
}

// @ts-ignore
export const withdrawWrappedExpectedMixin: PoolTemplate = {
    async withdrawWrappedExpected(lpTokenAmount: number | string): Promise<string[]> {
        const _lpTokenAmount = parseUnits(lpTokenAmount);
        const _expected = await _calcExpectedAmounts.call(this, _lpTokenAmount)

        return _expected.map((amount, i: number) => formatUnits(amount, this.wrappedDecimals[i]));
    },
}