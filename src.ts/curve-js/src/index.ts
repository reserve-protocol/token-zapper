import { PoolTemplate, getPool } from "./pools";
import {
    getBestRouteAndOutput,
} from "./router";
import { curve as _curve } from "./curve";

import {
    getBalances,
    getUsdRate,
    getTVL,
    getCoinsData,
    getVolume,
} from "./utils";
import { type Provider } from "@ethersproject/providers";

async function init(
    provider: Provider,
    feeData: () => ({ gasPrice?: bigint, maxFeePerGas?: bigint, maxPriorityFeePerGas?: bigint })
): Promise<void> {
    await _curve.init(provider, feeData);
    // @ts-ignore
    this.signerAddress = _curve.signerAddress;
    // @ts-ignore
    this.chainId = _curve.chainId;
}

const curve = {
    init,
    chainId: 0,
    signerAddress: '',
    getPoolList: _curve.getPoolList,
    PoolTemplate,
    getPool,
    getUsdRate,
    getTVL,
    getBalances,
    getCoinsData,
    getVolume,
    factory: {
        fetchPools: _curve.fetchFactoryPools,
        fetchNewPools: _curve.fetchNewFactoryPools,
        getPoolList: _curve.getFactoryPoolList
    },
    cryptoFactory: {
        fetchPools: _curve.fetchCryptoFactoryPools,
        fetchNewPools: _curve.fetchNewCryptoFactoryPools,
        getPoolList: _curve.getCryptoFactoryPoolList,

    },
    router: {
        getBestRouteAndOutput,
    },
}

export default curve;
