import { type PoolTemplate } from "../PoolTemplate";
import { curve } from "../../curve";
import { type BigNumber as ethersBigNumber } from "@ethersproject/bignumber"

// @ts-ignore
export const withdrawOneCoinExpectedMetaFactoryMixin: PoolTemplate = {
    async _withdrawOneCoinExpected(_lpTokenAmount: ethersBigNumber, i: number): Promise<ethersBigNumber> {
        const contract = curve.contracts[this.zap as string].contract;
        return await contract.calc_withdraw_one_coin(this.address, _lpTokenAmount, i, curve.constantOptions);
    },
}

// @ts-ignore
export const withdrawOneCoinExpectedZapMixin: PoolTemplate = {
    async _withdrawOneCoinExpected(_lpTokenAmount: ethersBigNumber, i: number): Promise<ethersBigNumber> {
        const contract = curve.contracts[this.zap as string].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve.constantOptions);
    },
}

// @ts-ignore
export const withdrawOneCoinExpected3argsMixin: PoolTemplate = {
    async _withdrawOneCoinExpected(_lpTokenAmount: ethersBigNumber, i: number): Promise<ethersBigNumber> {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, true, curve.constantOptions);
    },
}

// @ts-ignore
export const withdrawOneCoinExpected2argsMixin: PoolTemplate = {
    async _withdrawOneCoinExpected(_lpTokenAmount: ethersBigNumber, i: number): Promise<ethersBigNumber> {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve.constantOptions);
    },
}