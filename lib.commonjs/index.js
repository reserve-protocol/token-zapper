"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromProvider = exports.createEnso = exports.createKyberswap = exports.Universe = exports.Searcher = exports.configuration = exports.setupEthereumZapper = exports.ethereumConfig = exports.setupBaseZapper = exports.baseConfig = exports.setupArbitrumZapper = exports.arbiConfig = exports.TokenQuantity = exports.Token = exports.Address = void 0;
var Address_1 = require("./base/Address");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return Address_1.Address; } });
var Token_1 = require("./entities/Token");
Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return Token_1.Token; } });
Object.defineProperty(exports, "TokenQuantity", { enumerable: true, get: function () { return Token_1.TokenQuantity; } });
var arbitrum_1 = require("./configuration/arbitrum");
Object.defineProperty(exports, "arbiConfig", { enumerable: true, get: function () { return arbitrum_1.arbiConfig; } });
var setupArbitrumZapper_1 = require("./configuration/setupArbitrumZapper");
Object.defineProperty(exports, "setupArbitrumZapper", { enumerable: true, get: function () { return setupArbitrumZapper_1.setupArbitrumZapper; } });
var base_1 = require("./configuration/base");
Object.defineProperty(exports, "baseConfig", { enumerable: true, get: function () { return base_1.baseConfig; } });
var setupBaseZapper_1 = require("./configuration/setupBaseZapper");
Object.defineProperty(exports, "setupBaseZapper", { enumerable: true, get: function () { return setupBaseZapper_1.setupBaseZapper; } });
var ethereum_1 = require("./configuration/ethereum");
Object.defineProperty(exports, "ethereumConfig", { enumerable: true, get: function () { return ethereum_1.ethereumConfig; } });
var setupEthereumZapper_1 = require("./configuration/setupEthereumZapper");
Object.defineProperty(exports, "setupEthereumZapper", { enumerable: true, get: function () { return setupEthereumZapper_1.setupEthereumZapper; } });
const arbitrum_2 = require("./configuration/arbitrum");
const setupArbitrumZapper_2 = require("./configuration/setupArbitrumZapper");
const base_2 = require("./configuration/base");
const setupBaseZapper_2 = require("./configuration/setupBaseZapper");
const ethereum_2 = require("./configuration/ethereum");
const setupEthereumZapper_2 = require("./configuration/setupEthereumZapper");
const loadTokens_1 = require("./configuration/loadTokens");
const ChainConfiguration_1 = require("./configuration/ChainConfiguration");
const ReserveAddresses_1 = require("./configuration/ReserveAddresses");
const Universe_1 = require("./Universe");
exports.configuration = {
    utils: {
        loadTokens: loadTokens_1.loadTokens,
    },
    makeConfig: ChainConfiguration_1.makeConfig,
};
var Searcher_1 = require("./searcher/Searcher");
Object.defineProperty(exports, "Searcher", { enumerable: true, get: function () { return Searcher_1.Searcher; } });
var Universe_2 = require("./Universe");
Object.defineProperty(exports, "Universe", { enumerable: true, get: function () { return Universe_2.Universe; } });
var Kyberswap_1 = require("./aggregators/Kyberswap");
Object.defineProperty(exports, "createKyberswap", { enumerable: true, get: function () { return Kyberswap_1.createKyberswap; } });
var Enso_1 = require("./aggregators/Enso");
Object.defineProperty(exports, "createEnso", { enumerable: true, get: function () { return Enso_1.createEnso; } });
const CHAIN_ID_TO_CONFIG = {
    [ReserveAddresses_1.ChainIds.Mainnet]: {
        config: ethereum_2.ethereumConfig,
        blockTime: 12,
        setup: setupEthereumZapper_2.setupEthereumZapper,
    },
    [ReserveAddresses_1.ChainIds.Arbitrum]: {
        config: arbitrum_2.arbiConfig,
        blockTime: 0.25,
        setup: setupArbitrumZapper_2.setupArbitrumZapper,
    },
    [ReserveAddresses_1.ChainIds.Base]: {
        config: base_2.baseConfig,
        blockTime: 2,
        setup: setupBaseZapper_2.setupBaseZapper,
    },
};
const fromProvider = async (provider, chainId) => {
    const network = await provider.getNetwork();
    if (chainId !== network.chainId) {
        throw new Error(`provider chainId (${network.chainId}) does not match requested chainId (${chainId})`);
    }
    const { config, setup } = CHAIN_ID_TO_CONFIG[chainId];
    const universe = await Universe_1.Universe.createWithConfig(provider, config, async (uni) => {
        await setup(uni);
    });
    return universe;
};
exports.fromProvider = fromProvider;
//# sourceMappingURL=index.js.map