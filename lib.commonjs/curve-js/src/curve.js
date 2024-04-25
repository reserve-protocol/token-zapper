"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curve = exports.NETWORK_CONSTANTS = exports.NATIVE_TOKENS = void 0;
const tslib_1 = require("tslib");
const factory_1 = require("./factory/factory");
const factory_crypto_1 = require("./factory/factory-crypto");
const ERC20_json_1 = tslib_1.__importDefault(require("./constants/abis/ERC20.json"));
const cERC20_json_1 = tslib_1.__importDefault(require("./constants/abis/cERC20.json"));
const yERC20_json_1 = tslib_1.__importDefault(require("./constants/abis/yERC20.json"));
const minter_json_1 = tslib_1.__importDefault(require("./constants/abis/minter.json"));
const minter_child_json_1 = tslib_1.__importDefault(require("./constants/abis/minter_child.json"));
const votingescrow_json_1 = tslib_1.__importDefault(require("./constants/abis/votingescrow.json"));
const fee_distributor_json_1 = tslib_1.__importDefault(require("./constants/abis/fee_distributor.json"));
const address_provider_json_1 = tslib_1.__importDefault(require("./constants/abis/address_provider.json"));
const gaugecontroller_json_1 = tslib_1.__importDefault(require("./constants/abis/gaugecontroller.json"));
const router_json_1 = tslib_1.__importDefault(require("./constants/abis/router.json"));
const deposit_and_stake_json_1 = tslib_1.__importDefault(require("./constants/abis/deposit_and_stake.json"));
const registry_exchange_json_1 = tslib_1.__importDefault(require("./constants/abis/registry_exchange.json"));
const streamer_json_1 = tslib_1.__importDefault(require("./constants/abis/streamer.json"));
const factory_json_1 = tslib_1.__importDefault(require("./constants/abis/factory.json"));
const factory_crypto_json_1 = tslib_1.__importDefault(require("./constants/abis/factory-crypto.json"));
const pools_1 = require("./constants/pools");
const aliases_1 = require("./constants/aliases");
const ethereum_1 = require("./constants/coins/ethereum");
const utils_1 = require("./constants/utils");
const external_api_1 = require("./external-api");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const src_1 = require("../../ethcall/src");
const factory_api_1 = require("./factory/factory-api");
const router = tslib_1.__importStar(require("./router"));
const pools_2 = require("./pools");
const _killGauges = async (poolsData) => {
    const gaugeData = await (0, external_api_1._getAllGauges)();
    const isKilled = {};
    Object.values(gaugeData).forEach((d) => {
        isKilled[d.gauge.toLowerCase()] = d.is_killed ?? false;
    });
    for (const poolId in poolsData) {
        if (isKilled[poolsData[poolId].gauge_address]) {
            poolsData[poolId].gauge_address = constants_1.AddressZero;
        }
    }
};
exports.NATIVE_TOKENS = {
    1: {
        symbol: 'ETH',
        wrappedSymbol: 'WETH',
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        wrappedAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase(),
    }
};
exports.NETWORK_CONSTANTS = {
    1: {
        NAME: 'ethereum',
        ALIASES: aliases_1.ALIASES_ETHEREUM,
        POOLS_DATA: pools_1.POOLS_DATA_ETHEREUM,
        COINS: ethereum_1.COINS_ETHEREUM,
        cTokens: ethereum_1.cTokensEthereum,
        yTokens: ethereum_1.yTokensEthereum,
        ycTokens: ethereum_1.ycTokensEthereum,
        aTokens: ethereum_1.aTokensEthereum,
    }
};
class Curve {
    router = router;
    getPool(i) {
        return (0, pools_2.getPool)(i);
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
            NATIVE_TOKEN: exports.NATIVE_TOKENS[1],
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
            NATIVE_TOKEN: exports.NATIVE_TOKENS[1],
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
        this.constants.NATIVE_TOKEN = exports.NATIVE_TOKENS[this.chainId];
        this.constants.NETWORK_NAME = exports.NETWORK_CONSTANTS[this.chainId].NAME;
        this.constants.ALIASES = exports.NETWORK_CONSTANTS[this.chainId].ALIASES;
        this.constants.POOLS_DATA = exports.NETWORK_CONSTANTS[this.chainId].POOLS_DATA;
        for (const poolId in this.constants.POOLS_DATA)
            this.constants.POOLS_DATA[poolId].in_api = true;
        this.constants.COINS = exports.NETWORK_CONSTANTS[this.chainId].COINS;
        this.constants.DECIMALS = (0, utils_1.extractDecimals)(this.constants.POOLS_DATA);
        this.constants.DECIMALS[this.constants.NATIVE_TOKEN.address] = 18;
        this.constants.DECIMALS[this.constants.NATIVE_TOKEN.wrappedAddress] = 18;
        this.constants.GAUGES = (0, utils_1.extractGauges)(this.constants.POOLS_DATA);
        const [cTokens, yTokens, ycTokens, aTokens] = [
            exports.NETWORK_CONSTANTS[this.chainId].cTokens,
            exports.NETWORK_CONSTANTS[this.chainId].yTokens,
            exports.NETWORK_CONSTANTS[this.chainId].ycTokens,
            exports.NETWORK_CONSTANTS[this.chainId].aTokens,
        ];
        const customAbiTokens = [...cTokens, ...yTokens, ...ycTokens, ...aTokens];
        await _killGauges(this.constants.POOLS_DATA);
        this.multicallProvider = new src_1.Provider(1, provider);
        this.feeData = feeData;
        for (const pool of Object.values(this.constants.POOLS_DATA)) {
            if (!this.whitelist.has(pool.swap_address.toLowerCase())) {
                continue;
            }
            await this.setContract(pool.swap_address, pool.swap_abi());
            if (pool.token_address !== pool.swap_address) {
                await this.setContract(pool.token_address, ERC20_json_1.default);
            }
            if (pool.gauge_address !== constants_1.AddressZero) {
                await this.setContract(pool.gauge_address, pool.gauge_abi());
            }
            if (pool.deposit_address && !this.contracts[pool.deposit_address] && pool.deposit_abi != null) {
                await this.setContract(pool.deposit_address, pool.deposit_abi());
            }
            for (const coinAddr of pool.underlying_coin_addresses) {
                await this.setContract(coinAddr, ERC20_json_1.default);
            }
            for (const coinAddr of pool.wrapped_coin_addresses) {
                if (customAbiTokens.includes(coinAddr))
                    continue;
                if (coinAddr in this.contracts)
                    continue;
                await this.setContract(coinAddr, ERC20_json_1.default);
            }
            // TODO add all coins
            for (const coinAddr of pool.wrapped_coin_addresses) {
                if (cTokens.includes(coinAddr)) {
                    await this.setContract(coinAddr, cERC20_json_1.default);
                }
                if (aTokens.includes(coinAddr)) {
                    await this.setContract(coinAddr, ERC20_json_1.default);
                }
                if (yTokens.includes(coinAddr) || ycTokens.includes(coinAddr)) {
                    await this.setContract(coinAddr, yERC20_json_1.default);
                }
            }
            if (pool.reward_contract) {
                await this.setContract(pool.reward_contract, streamer_json_1.default);
            }
            if (pool.sCurveRewards_address && pool.sCurveRewards_abi != null) {
                await this.setContract(pool.sCurveRewards_address, pool.sCurveRewards_abi());
            }
        }
        await this.setContract(this.constants.NATIVE_TOKEN.wrappedAddress, ERC20_json_1.default);
        await this.setContract(this.constants.ALIASES.crv, ERC20_json_1.default);
        this.constants.DECIMALS[this.constants.ALIASES.crv] = 18;
        const _minterABI = this.chainId === 1 ? minter_json_1.default : minter_child_json_1.default;
        await this.setContract(this.constants.ALIASES.minter, _minterABI);
        await this.setContract(this.constants.ALIASES.voting_escrow, votingescrow_json_1.default);
        await this.setContract(this.constants.ALIASES.fee_distributor, fee_distributor_json_1.default);
        await this.setContract(this.constants.ALIASES.address_provider, address_provider_json_1.default);
        const addressProviderContract = this.contracts[this.constants.ALIASES.address_provider].contract;
        this.constants.ALIASES.registry_exchange = (await addressProviderContract.get_address(2, this.constantOptions)).toLowerCase();
        await this.setContract(this.constants.ALIASES.registry_exchange, registry_exchange_json_1.default);
        await this.setContract(this.constants.ALIASES.gauge_controller, gaugecontroller_json_1.default);
        await this.setContract(this.constants.ALIASES.router, router_json_1.default);
        await this.setContract(this.constants.ALIASES.deposit_and_stake, deposit_and_stake_json_1.default);
        await this.setContract(this.constants.ALIASES.factory, factory_json_1.default);
        await this.setContract(this.constants.ALIASES.crypto_factory, factory_crypto_json_1.default);
    }
    async setContract(address, abi) {
        this.contracts[address] = {
            contract: new contracts_1.Contract(address, await abi, this.provider),
            multicallContract: new src_1.Contract(address, await abi),
        };
    }
    async _filterHiddenPools(pools) {
        const hiddenPools = (await (0, external_api_1._getHiddenPools)())[this.constants.NETWORK_NAME] || [];
        // @ts-ignore
        return Object.fromEntries(Object.entries(pools).filter(([id]) => !hiddenPools.includes(id)));
    }
    _updateDecimalsAndGauges(pools) {
        this.constants.DECIMALS = { ...this.constants.DECIMALS, ...(0, utils_1.extractDecimals)(pools) };
        this.constants.GAUGES = [...this.constants.GAUGES, ...(0, utils_1.extractGauges)(pools)];
    }
    fetchFactoryPools = async (useApi = true) => {
        if (useApi) {
            this.constants.FACTORY_POOLS_DATA = (0, utils_1.lowerCasePoolDataAddresses)(await factory_api_1.getFactoryPoolsDataFromApi.call(this, false));
        }
        else {
            this.constants.FACTORY_POOLS_DATA = (0, utils_1.lowerCasePoolDataAddresses)(await factory_1.getFactoryPoolData.call(this));
        }
        this.constants.FACTORY_POOLS_DATA = await this._filterHiddenPools(this.constants.FACTORY_POOLS_DATA);
        this._updateDecimalsAndGauges(this.constants.FACTORY_POOLS_DATA);
        await _killGauges(this.constants.FACTORY_POOLS_DATA);
    };
    fetchCryptoFactoryPools = async (useApi = true) => {
        if (useApi) {
            this.constants.CRYPTO_FACTORY_POOLS_DATA = (0, utils_1.lowerCasePoolDataAddresses)(await factory_api_1.getFactoryPoolsDataFromApi.call(this, true));
        }
        else {
            this.constants.CRYPTO_FACTORY_POOLS_DATA = (0, utils_1.lowerCasePoolDataAddresses)(await factory_crypto_1.getCryptoFactoryPoolData.call(this));
        }
        this.constants.CRYPTO_FACTORY_POOLS_DATA = await this._filterHiddenPools(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        this._updateDecimalsAndGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        await _killGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
    };
    fetchNewFactoryPools = async () => {
        const currentPoolIds = Object.keys(this.constants.FACTORY_POOLS_DATA);
        const lastPoolIdx = Number(currentPoolIds[currentPoolIds.length - 1].split("-")[2]);
        const poolData = (0, utils_1.lowerCasePoolDataAddresses)(await factory_1.getFactoryPoolData.call(this, lastPoolIdx + 1));
        this.constants.FACTORY_POOLS_DATA = { ...this.constants.FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.FACTORY_POOLS_DATA);
        return Object.keys(poolData);
    };
    fetchNewCryptoFactoryPools = async () => {
        const currentPoolIds = Object.keys(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        const lastPoolIdx = Number(currentPoolIds[currentPoolIds.length - 1].split("-")[2]);
        const poolData = (0, utils_1.lowerCasePoolDataAddresses)(await factory_crypto_1.getCryptoFactoryPoolData.call(this, lastPoolIdx + 1));
        this.constants.CRYPTO_FACTORY_POOLS_DATA = { ...this.constants.CRYPTO_FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        return Object.keys(poolData);
    };
    fetchRecentlyDeployedFactoryPool = async (poolAddress) => {
        const poolData = (0, utils_1.lowerCasePoolDataAddresses)(await factory_1.getFactoryPoolData.call(this, 0, poolAddress));
        this.constants.FACTORY_POOLS_DATA = { ...this.constants.FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.FACTORY_POOLS_DATA);
        return Object.keys(poolData)[0]; // id
    };
    fetchRecentlyDeployedCryptoFactoryPool = async (poolAddress) => {
        const poolData = (0, utils_1.lowerCasePoolDataAddresses)(await factory_crypto_1.getCryptoFactoryPoolData.call(this, 0, poolAddress));
        this.constants.CRYPTO_FACTORY_POOLS_DATA = { ...this.constants.CRYPTO_FACTORY_POOLS_DATA, ...poolData };
        this._updateDecimalsAndGauges(this.constants.CRYPTO_FACTORY_POOLS_DATA);
        return Object.keys(poolData)[0]; // id
    };
    getPoolList = () => Object.keys(this.constants.POOLS_DATA);
    getFactoryPoolList = () => Object.keys(this.constants.FACTORY_POOLS_DATA);
    getCryptoFactoryPoolList = () => Object.keys(this.constants.CRYPTO_FACTORY_POOLS_DATA);
}
exports.curve = new Curve();
//# sourceMappingURL=curve.js.map