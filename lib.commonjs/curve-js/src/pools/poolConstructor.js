"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = void 0;
const PoolTemplate_1 = require("./PoolTemplate");
const poolBalancesMixin_1 = require("./mixins/poolBalancesMixin");
const swapWrappedMixins_1 = require("./mixins/swapWrappedMixins");
const withdrawExpectedMixins_1 = require("./mixins/withdrawExpectedMixins");
const withdrawOneCoinExpectedMixins_1 = require("./mixins/withdrawOneCoinExpectedMixins");
const withdrawOneCoinWrappedExpectedMixins_1 = require("./mixins/withdrawOneCoinWrappedExpectedMixins");
const poolStore = new Map();
const getPool = (poolId) => {
    if (poolStore.has(poolId)) {
        return poolStore.get(poolId);
    }
    const poolDummy = new PoolTemplate_1.PoolTemplate(poolId);
    class Pool extends PoolTemplate_1.PoolTemplate {
    }
    // statsBalances
    if (poolDummy.isMeta) {
        Object.assign(Pool.prototype, poolBalancesMixin_1.poolBalancesMetaMixin);
    }
    else if (poolDummy.useLending.reduce((x, y) => x || y)) {
        Object.assign(Pool.prototype, poolBalancesMixin_1.poolBalancesLendingMixin);
    }
    // withdrawExpected
    if (poolDummy.isMeta) {
        Object.assign(Pool.prototype, withdrawExpectedMixins_1.withdrawExpectedMetaMixin);
    }
    else if (poolDummy.isLending || (poolDummy.isCrypto && !poolDummy.isPlain)) {
        Object.assign(Pool.prototype, withdrawExpectedMixins_1.withdrawExpectedLendingOrCryptoMixin);
    }
    else {
        Object.assign(Pool.prototype, withdrawExpectedMixins_1.withdrawExpectedMixin);
    }
    if (!poolDummy.isPlain && !poolDummy.isFake) {
        if (((poolDummy.isLending || poolDummy.isCrypto) && !poolDummy.zap) || (poolDummy.isCrypto && poolDummy.isMetaFactory)) {
            Object.assign(Pool.prototype, withdrawExpectedMixins_1.withdrawWrappedExpectedMixin);
        }
        else {
            Object.assign(Pool.prototype, withdrawExpectedMixins_1.withdrawWrappedExpectedMixin);
        }
    }
    // withdrawOneCoinExpected
    if (poolDummy.isMetaFactory) {
        Object.assign(Pool.prototype, withdrawOneCoinExpectedMixins_1.withdrawOneCoinExpectedMetaFactoryMixin);
    }
    else if ((!poolDummy.isCrypto && poolDummy.zap) || poolDummy.isMeta) { // including susd
        Object.assign(Pool.prototype, withdrawOneCoinExpectedMixins_1.withdrawOneCoinExpectedZapMixin);
    }
    else if (poolId === 'ib') {
        Object.assign(Pool.prototype, withdrawOneCoinExpectedMixins_1.withdrawOneCoinExpected3argsMixin);
    }
    else {
        Object.assign(Pool.prototype, withdrawOneCoinExpectedMixins_1.withdrawOneCoinExpected2argsMixin);
    }
    // withdrawOneCoinWrappedExpected
    if (!poolDummy.isPlain && !poolDummy.isFake && !(poolDummy.isLending && poolDummy.zap)) {
        if (poolId === "ib") {
            Object.assign(Pool.prototype, withdrawOneCoinWrappedExpectedMixins_1.withdrawOneCoinWrappedExpected3argsMixin);
        }
        else {
            Object.assign(Pool.prototype, withdrawOneCoinWrappedExpectedMixins_1.withdrawOneCoinWrappedExpected2argsMixin);
        }
    }
    // swapWrapped and swapWrappedEstimateGas
    if (!poolDummy.isPlain && !poolDummy.isFake) {
        Object.assign(Pool.prototype, swapWrappedMixins_1.swapWrappedExpectedAndApproveMixin);
    }
    const out = new Pool(poolId);
    poolStore.set(poolId, out);
    return out;
};
exports.getPool = getPool;
//# sourceMappingURL=poolConstructor.js.map