import { curve } from "../../curve";
// @ts-ignore
export const withdrawOneCoinWrappedExpected2argsMixin = {
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount, i) {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve.constantOptions);
    },
};
// @ts-ignore
export const withdrawOneCoinWrappedExpected3argsMixin = {
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount, i) {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, false, curve.constantOptions);
    },
};
//# sourceMappingURL=withdrawOneCoinWrappedExpectedMixins.js.map