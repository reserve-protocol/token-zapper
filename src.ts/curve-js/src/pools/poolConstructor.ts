import { PoolTemplate } from "./PoolTemplate";
import { poolBalancesMetaMixin, poolBalancesLendingMixin } from "./mixins/poolBalancesMixin";

import { swapWrappedExpectedAndApproveMixin } from "./mixins/swapWrappedMixins";
import { withdrawExpectedMixin, withdrawExpectedLendingOrCryptoMixin, withdrawExpectedMetaMixin, withdrawWrappedExpectedMixin } from "./mixins/withdrawExpectedMixins";

import { withdrawOneCoinExpectedMetaFactoryMixin, withdrawOneCoinExpectedZapMixin, withdrawOneCoinExpected3argsMixin, withdrawOneCoinExpected2argsMixin } from "./mixins/withdrawOneCoinExpectedMixins";
import { withdrawOneCoinWrappedExpected2argsMixin, withdrawOneCoinWrappedExpected3argsMixin } from "./mixins/withdrawOneCoinWrappedExpectedMixins";

const poolStore = new Map<string, PoolTemplate>();

export const getPool = (poolId: string): PoolTemplate => {
    if (poolStore.has(poolId)) {
        return poolStore.get(poolId)!;
    }
    const poolDummy = new PoolTemplate(poolId);
    class Pool extends PoolTemplate { }

    // statsBalances
    if (poolDummy.isMeta) {
        Object.assign(Pool.prototype, poolBalancesMetaMixin);
    } else if (poolDummy.useLending.reduce((x, y) => x || y)) {
        Object.assign(Pool.prototype, poolBalancesLendingMixin);
    }

    // withdrawExpected
    if (poolDummy.isMeta) {
        Object.assign(Pool.prototype, withdrawExpectedMetaMixin);
    } else if (poolDummy.isLending || (poolDummy.isCrypto && !poolDummy.isPlain)) {
        Object.assign(Pool.prototype, withdrawExpectedLendingOrCryptoMixin);
    } else {
        Object.assign(Pool.prototype, withdrawExpectedMixin);
    }
    if (!poolDummy.isPlain && !poolDummy.isFake) {
        if (((poolDummy.isLending || poolDummy.isCrypto) && !poolDummy.zap) || (poolDummy.isCrypto && poolDummy.isMetaFactory)) {
            Object.assign(Pool.prototype, withdrawWrappedExpectedMixin);
        } else {
            Object.assign(Pool.prototype, withdrawWrappedExpectedMixin);
        }
    }
    // withdrawOneCoinExpected
    if (poolDummy.isMetaFactory) {
        Object.assign(Pool.prototype, withdrawOneCoinExpectedMetaFactoryMixin);
    } else if ((!poolDummy.isCrypto && poolDummy.zap) || poolDummy.isMeta) { // including susd
        Object.assign(Pool.prototype, withdrawOneCoinExpectedZapMixin);
    } else if (poolId === 'ib') {
        Object.assign(Pool.prototype, withdrawOneCoinExpected3argsMixin);
    } else {
        Object.assign(Pool.prototype, withdrawOneCoinExpected2argsMixin);
    }

    // withdrawOneCoinWrappedExpected
    if (!poolDummy.isPlain && !poolDummy.isFake && !(poolDummy.isLending && poolDummy.zap)) {
        if (poolId === "ib") {
            Object.assign(Pool.prototype, withdrawOneCoinWrappedExpected3argsMixin);
        } else {
            Object.assign(Pool.prototype, withdrawOneCoinWrappedExpected2argsMixin);
        }
    }

    // swapWrapped and swapWrappedEstimateGas
    if (!poolDummy.isPlain && !poolDummy.isFake) {
        Object.assign(Pool.prototype, swapWrappedExpectedAndApproveMixin);
    }
    const out = new Pool(poolId)
    poolStore.set(poolId, out)
    return out
}