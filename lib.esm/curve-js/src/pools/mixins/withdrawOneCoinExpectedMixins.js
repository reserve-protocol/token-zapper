import { curve } from "../../curve";
// @ts-ignore
export const withdrawOneCoinExpectedMetaFactoryMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve.contracts[this.zap].contract;
        return await contract.calc_withdraw_one_coin(this.address, _lpTokenAmount, i, curve.constantOptions);
    },
};
// @ts-ignore
export const withdrawOneCoinExpectedZapMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve.contracts[this.zap].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve.constantOptions);
    },
};
// @ts-ignore
export const withdrawOneCoinExpected3argsMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, true, curve.constantOptions);
    },
};
// @ts-ignore
export const withdrawOneCoinExpected2argsMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve.constantOptions);
    },
};
//# sourceMappingURL=withdrawOneCoinExpectedMixins.js.map