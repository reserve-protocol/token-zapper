"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapWrappedExpectedAndApproveMixin = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
// @ts-ignore
exports.swapWrappedExpectedAndApproveMixin = {
    async swapWrappedExpected(inputCoin, outputCoin, amount) {
        // @ts-ignore
        const i = this._getCoinIdx(inputCoin, false);
        // @ts-ignore
        const j = this._getCoinIdx(outputCoin, false);
        const _amount = (0, utils_1.parseUnits)(amount, this.wrappedDecimals[i]);
        // @ts-ignore
        const _expected = await this._swapWrappedExpected(i, j, _amount);
        return (0, units_1.formatUnits)(_expected, this.wrappedDecimals[j]);
    },
};
//# sourceMappingURL=swapWrappedMixins.js.map