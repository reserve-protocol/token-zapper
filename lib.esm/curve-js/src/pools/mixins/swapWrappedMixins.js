import { formatUnits } from "@ethersproject/units";
import { parseUnits } from "../../utils";
// @ts-ignore
export const swapWrappedExpectedAndApproveMixin = {
    async swapWrappedExpected(inputCoin, outputCoin, amount) {
        // @ts-ignore
        const i = this._getCoinIdx(inputCoin, false);
        // @ts-ignore
        const j = this._getCoinIdx(outputCoin, false);
        const _amount = parseUnits(amount, this.wrappedDecimals[i]);
        // @ts-ignore
        const _expected = await this._swapWrappedExpected(i, j, _amount);
        return formatUnits(_expected, this.wrappedDecimals[j]);
    },
};
//# sourceMappingURL=swapWrappedMixins.js.map