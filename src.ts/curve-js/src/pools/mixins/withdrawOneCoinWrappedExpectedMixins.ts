import { type PoolTemplate } from "../PoolTemplate";
import { curve } from "../../curve";
import { type BigNumber as ethersBigNumber } from "@ethersproject/bignumber"

// @ts-ignore
export const withdrawOneCoinWrappedExpected2argsMixin: PoolTemplate = {
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount: ethersBigNumber, i: number): Promise<ethersBigNumber> {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve.constantOptions);
    },
}

// @ts-ignore
export const withdrawOneCoinWrappedExpected3argsMixin: PoolTemplate = {
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount: ethersBigNumber, i: number): Promise<ethersBigNumber> {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, false, curve.constantOptions);
    },
}