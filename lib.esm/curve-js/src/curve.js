import { getFactoryPoolData } from "./factory/factory";
import { getCryptoFactoryPoolData } from "./factory/factory-crypto";
import ERC20Abi from './constants/abis/ERC20.json';
import cERC20Abi from './constants/abis/cERC20.json';
import yERC20Abi from './constants/abis/yERC20.json';
import minterABI from './constants/abis/minter.json';
import minterChildABI from './constants/abis/minter_child.json';
import votingEscrowABI from './constants/abis/votingescrow.json';
import feeDistributorABI from './constants/abis/fee_distributor.json';
import addressProviderABI from './constants/abis/address_provider.json';
import gaugeControllerABI from './constants/abis/gaugecontroller.json';
import routerABI from './constants/abis/router.json';
import depositAndStakeABI from './constants/abis/deposit_and_stake.json';
import registryExchangeABI from './constants/abis/registry_exchange.json';
import streamerABI from './constants/abis/streamer.json';
import factoryABI from './constants/abis/factory.json';
import cryptoFactoryABI from './constants/abis/factory-crypto.json';
import { POOLS_DATA_ETHEREUM, } from './constants/pools';
import { ALIASES_ETHEREUM, } from "./constants/aliases";
import { COINS_ETHEREUM, cTokensEthereum, yTokensEthereum, ycTokensEthereum, aTokensEthereum } from "./constants/coins/ethereum";
import { lowerCasePoolDataAddresses, extractDecimals, extractGauges } from "./constants/utils";
import { _getAllGauges, _getHiddenPools } from "./external-api";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from '@ethersproject/contracts';
import { Provider as MulticallProvider, Contract as MulticallContract } from '../../ethcall/src';
import { getFactoryPoolsDataFromApi } from "./factory/factory-api";
import * as router from "./router";
import { getPool } from "./pools";
const _killGauges = async (poolsData) => {
    const gaugeData = await _getAllGauges();
    const isKilled = {};
    Object.values(gaugeData).forEach((d) => {
        isKilled[d.gauge.toLowerCase()] = d.is_killed ?? false;
    });
    for (const poolId in poolsData) {
        if (isKilled[poolsData[poolId].gauge_address]) {
            poolsData[poolId].gauge_address = AddressZero;
        }
    }
};
export const NATIVE_TOKENS = {
    1: {
        symbol: 'ETH',
        wrappedSymbol: 'WETH',
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        wrappedAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase(),
    }
};
export const NETWORK_CONSTANTS = {
    1: {
        NAME: 'ethereum',
        ALIASES: ALIASES_ETHEREUM,
        POOLS_DATA: POOLS_DATA_ETHEREUM,
        COINS: COINS_ETHEREUM,
        cTokens: cTokensEthereum,
        yTokens: yTokensEthereum,
        ycTokens: ycTokensEthereum,
        aTokens: aTokensEthereum,
    }
};
class Curve {
    router = router;
    getPool(i) {
        return getPool(i);
    }
    provider;
    multicallProvider;
    signerAddress;
    chainId;
    whitelist = new Set();
    get options() {
        return this.feeData();
    }
    contracts;
    feeData = () => ({});
    constantOptions;
    constants;
    constructor() {
        // @ts-ignore
        this.provider = null;
        // @ts-ignore
        this.signer = null;
        this.signerAddress = '';
        this.chainId = 1;
        // @ts-ignore
        this.multicallProvider = null;
        this.contracts = {};
        this.constantOptions = { gasLimit: 12000000 };
        this.constants = {
            NATIVE_TOKEN: NATIVE_TOKENS[1],
            NETWORK_NAME: 'ethereum',
            ALIASES: {},
            POOLS_DATA: {},
            FACTORY_POOLS_DATA: {},
            CRYPTO_FACTORY_POOLS_DATA: {},
            COINS: {},
            DECIMALS: {},
            GAUGES: [],
        };
    }
    async init(provider, feeData, extraOptions) {
        this.whitelist = extraOptions.whitelist;
        // @ts-ignore
        this.provider = null;
        // @ts-ignore
        this.signer = null;
        this.signerAddress = '';
        this.chainId = 1;
        // @ts-ignore
        this.multicallProvider = null;
        this.contracts = {};
        this.constantOptions = { gasLimit: 12000000 };
        this.constants = {
            NATIVE_TOKEN: NATIVE_TOKENS[1],
            NETWORK_NAME: 'ethereum',
            ALIASES: {},
            POOLS_DATA: {},
            FACTORY_POOLS_DATA: {},
            CRYPTO_FACTORY_POOLS_DATA: {},
            COINS: {},
            DECIMALS: {},
            GAUGES: [],
        };
        // JsonRpc provider
        this.provider = provider;
        this.chainId = 1;
        this.constants.NATIVE_TOKEN = NATIVE_TOKENS[this.chainId];
        this.constants.NETWORK_NAME = NETWORK_CONSTANTS[this.chainId].NAME;
        this.constants.ALIASES = NETWORK_CONSTANTS[this.chainId].ALIASES;
        this.constants.POOLS_DATA = NETWORK_CONSTANTS[this.chainId].POOLS_DATA;
        for (const poolId in this.constants.POOLS_DATA)
            this.constants.POOLS_DATA[poolId].in_api = true;
        this.constants.COINS = NETWORK_CONSTANTS[this.chainId].COINS;
        this.constants.DECIMALS = extractDecimals(this.constants.POOLS_DATA);
        this.constants.DECIMALS[this.constants.NATIVE_TOKEN.address] = 18;
        this.constants.DECIMALS[this.constants.NATIVE_TOKEN.wrappedAddress] = 18;
        this.constants.GAUGES = extractGauges(this.constants.POOLS_DATA);
        const [cTokens, yTokens, ycTokens, aTokens] = [
            NETWORK_CONSTANTS[this.chainId].cTokens,
            NETWORK_CONSTANTS[this.chainId].yTokens,
            NETWORK_CONSTANTS[this.chainId].ycTokens,
            NETWORK_CONSTANTS[this.chainId].aTokens,
        ];
        const customAbiTokens = [...cTokens, ...yTokens, ...ycTokens, ...aTokens];
        await _killGauges(this.constants.POOLS_DATA);
        this.multicallProvider = new MulticallProvider(1, provider);
        this.feeData = feeData;
        for (const pool of Object.values(this.constants.POOLS_DATA)) {
            if (!this.whitelist.has(pool.swap_address.toLowerCase())) {
                continue;
            }
            await this.setContract(pool.swap_address, pool.swap_abi());
            if (pool.token_address !== pool.swap_address) {
                await this.setContract(pool.token_address, ERC20Abi);
            }
            if (pool.gauge_address !== AddressZero) {
                await this.setContract(pool.gauge_address, pool.gauge_abi());
            }
            if (pool.deposit_address && !this.contracts[pool.deposit_address] && pool.deposit_abi != null) {
                await this.setContract(pool.deposit_address, pool.deposit_abi());
            }
            for (const coinAddr of pool.underlying_coin_addresses) {
                await this.setContract(coinAddr, ERC20Abi);
            }
            for (const coinAddr of pool.wrapped_coin_addresses) {
                if (customAbiTokens.includes(coinAddr))
                    continue;
                if (coinAddr in this.contracts)
                    continue;
                await this.setContract(coinAddr, ERC20Abi);
            }
            // TODO add all coins
            for (const coinAddr of pool.wrapped_coin_addresses) {
                if (cTokens.includes(coinAddr)) {
                    await this.setContract(coinAddr, cERC20Abi);
                }
                if (aTokens.includes(coinAddr)) {
                    await this.setContract(coinAddr, ERC20Abi);
                }
                if (yTokens.includes(coinAddr) || ycTokens.includes(coinAddr)) {
                    await this.setContract(coinAddr, yERC20Abi);
                }
            }
            if (pool.reward_contract) {
                await this.setContract(pool.reward_contract, streamerABI);
            }
            if (pool.sCurveRewards_address && pool.sCurveRewards_abi != null) {
                await this.setContract(pool.sCurveRewards_address, pool.sCurveRewards_abi());
            }
        }
        await this.setContract(this.constants.NATIVE_TOKEN.wrappedAddress, ERC20Abi);
        await this.setContract(this.constants.ALIASES.crv, ERC20Abi);
        this.constants.DECIMALS[this.constants.ALIASES.crv] = 18;
        const _minterABI = this.chainId === 1 ? minterABI : minterChildABI;
        await this.setContract(this.constants.ALIASES.minter, _minterABI);
        await this.setContract(this.constants.ALIASES.voting_escrow, votingEscrowABI);
        await this.setContract(this.constants.ALIASES.fee_distributor, feeDistributorABI);
        await this.setContract(this.constants.ALIASES.address_provider, addressProviderABI);
        const addressProviderContract = this.contracts[this.constants.ALIASES.address_provider].contract;
        this.constants.ALIASES.registry_exchange = (await addressProviderContract.get_address(2, this.constantOptions)).toLowerCase();
        await this.setContract(this.constants.ALIASES.registry_exchange, registryExchangeABI);
        await this.setContract(this.constants.ALIASES.gauge_controller, gaugeControllerABI);
        await this.setContract(this.constants.ALIASES.router, routerABI);
        await this.setContract(this.constants.ALIASES.deposit_and_stake, depositAndStakeABI);
        await this.setContract(this.constants.ALIASES.factory, factoryABI);
        await this.setContract(this.constants.ALIASES.crypto_factory, cryptoFactoryABI);
    }
    async setContract(address, abi) {
        this.contracts[address] = {
            contract: new Contract(address, await abi, this.provider),
            multicallContract: new MulticallContract(address, await abi),
        };
    }
    async _filterHiddenPools(pools) {
        const hiddenPools = (await _getHiddenPools())[this.constants.NETWORK_NAME] || [];
        // @ts-ignore
        return Object.fromEntries(Object.entries(pools).filter(([id]) => !hiddenPools.includes(id)));
    }
    _updateDecimalsAndGauges(pools) {
        this.constants.DECIMALS = { ...this.constants.DECIMALS, ...extractDecimals(pools) };
        this.constants.GAUGES = [...this.constants.GAUGES, ...extractGauges(pools)];
    }
    fetchFactoryPools = async (useApi = true) => {
        if (useApi) {
            this.constants.FACTORY_POOLS_DATA = lowerCasePoolDataAddresses(await getFactoryPoolsDataFromApi.call(this, false));
        }
        else {
            this.constants.FACTORY_POOLS_DATA = lowerCasePoolDataAddresses(await getFactoryPoolData.call(this));
        }
        this.constants.FACTORY_POOLS_DATA = await this._filterHiddenPools(this.constants.FACTORY_POOLS_DATA);
        this._updateDecimalsAndGauges(this.constants.FACTORY_POOLS_DATA);
        await _killGauges(this.constants.FACTORY_POOLS_DATA);
    };
    fetchCryptoFactoryPools = async (useApi = true) => {
        if (useApi) {
            this.constants.CRYPTO_FACTORY_POOLS_DATA = lowerCasePoolDataAddresses(await getFactoryPoolsDataFromApi.call(this, true));
        }
        else {
            this.constants.CRYPTO_FACTORY_POOLS_DATA = lowerCasePoolDataAddresses(await getCryptoFactoryPoolData.call(this));
        }
        this.constants.CRYPTO_FACTORY_POOLS_DATA = await this._filterHiddenPools(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        this._updateDecimalsAndGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        await _killGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
    };
    fetchNewFactoryPools = async () => {
        const currentPoolIds = Object.keys(this.constants.FACTORY_POOLS_DATA);
        const lastPoolIdx = Number(currentPoolIds[currentPoolIds.length - 1].split("-")[2]);
        const poolData = lowerCasePoolDataAddresses(await getFactoryPoolData.call(this, lastPoolIdx + 1));
        this.constants.FACTORY_POOLS_DATA = { ...this.constants.FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.FACTORY_POOLS_DATA);
        return Object.keys(poolData);
    };
    fetchNewCryptoFactoryPools = async () => {
        const currentPoolIds = Object.keys(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        const lastPoolIdx = Number(currentPoolIds[currentPoolIds.length - 1].split("-")[2]);
        const poolData = lowerCasePoolDataAddresses(await getCryptoFactoryPoolData.call(this, lastPoolIdx + 1));
        this.constants.CRYPTO_FACTORY_POOLS_DATA = { ...this.constants.CRYPTO_FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        return Object.keys(poolData);
    };
    fetchRecentlyDeployedFactoryPool = async (poolAddress) => {
        const poolData = lowerCasePoolDataAddresses(await getFactoryPoolData.call(this, 0, poolAddress));
        this.constants.FACTORY_POOLS_DATA = { ...this.constants.FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.FACTORY_POOLS_DATA);
        return Object.keys(poolData)[0]; // id
    };
    fetchRecentlyDeployedCryptoFactoryPool = async (poolAddress) => {
        const poolData = lowerCasePoolDataAddresses(await getCryptoFactoryPoolData.call(this, 0, poolAddress));
        this.constants.CRYPTO_FACTORY_POOLS_DATA = { ...this.constants.CRYPTO_FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        return Object.keys(poolData)[0]; // id
    };
    getPoolList = () => Object.keys(this.constants.POOLS_DATA);
    getFactoryPoolList = () => Object.keys(this.constants.FACTORY_POOLS_DATA);
    getCryptoFactoryPoolList = () => Object.keys(this.constants.CRYPTO_FACTORY_POOLS_DATA);
}
export const curve = new Curve();
//# sourceMappingURL=curve.js.map