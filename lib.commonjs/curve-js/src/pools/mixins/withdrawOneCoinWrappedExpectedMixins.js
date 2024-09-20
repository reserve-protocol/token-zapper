"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawOneCoinWrappedExpected3argsMixin = exports.withdrawOneCoinWrappedExpected2argsMixin = void 0;
const curve_1 = require("../../curve");
// @ts-ignore
exports.withdrawOneCoinWrappedExpected2argsMixin = {
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount, i) {
        const contract = curve_1.curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, curve_1.curve.constantOptions);
    },
};
// @ts-ignore
exports.withdrawOneCoinWrappedExpected3argsMixin = {
    async _withdrawOneCoinWrappedExpected(_lpTokenAmount, i) {
        const contract = curve_1.curve.contracts[this.address].contract;
        return await contract.calc_withdraw_one_coin(_lpTokenAmount, i, false, curve_1.curve.constantOptions);
    },
};
//# sourceMappingURL=withdrawOneCoinWrappedExpectedMixins.js.map