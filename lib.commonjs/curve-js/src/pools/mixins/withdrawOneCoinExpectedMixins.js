"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawOneCoinExpected2argsMixin = exports.withdrawOneCoinExpected3argsMixin = exports.withdrawOneCoinExpectedZapMixin = exports.withdrawOneCoinExpectedMetaFactoryMixin = void 0;
const curve_1 = require("../../curve");
// @ts-ignore
exports.withdrawOneCoinExpectedMetaFactoryMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve_1.curve.contracts[this.zap].contract;
        return await contract.calc_withdraw_one_coin(this.address, _lpTokenAmount, i, curve_1.curve.constantOptions);
    },
};
// @ts-ignore
exports.withdrawOneCoinExpectedZapMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve_1.curve.contracts[this.zap].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve_1.curve.constantOptions);
    },
};
// @ts-ignore
exports.withdrawOneCoinExpected3argsMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve_1.curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, true, curve_1.curve.constantOptions);
    },
};
// @ts-ignore
exports.withdrawOneCoinExpected2argsMixin = {
    async _withdrawOneCoinExpected(_lpTokenAmount, i) {
        const contract = curve_1.curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve_1.curve.constantOptions);
    },
};
//# sourceMappingURL=withdrawOneCoinExpectedMixins.js.map