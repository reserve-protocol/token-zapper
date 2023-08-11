import { formatUnits } from "@ethersproject/units";
import {
    parseUnits
} from "../../utils";
import { type PoolTemplate } from "../PoolTemplate";


// @ts-ignore
export const swapWrappedExpectedAndApproveMixin: PoolTemplate = {
    async swapWrappedExpected(inputCoin: string | number, outputCoin: string | number, amount: number | string): Promise<string> {
        // @ts-ignore
        const i = this._getCoinIdx(inputCoin, false);
        // @ts-ignore
        const j = this._getCoinIdx(outputCoin, false);
        const _amount = parseUnits(amount, this.wrappedDecimals[i]);
        // @ts-ignore
        const _expected = await this._swapWrappedExpected(i, j, _amount);

        return formatUnits(_expected, this.wrappedDecimals[j])
    },
}