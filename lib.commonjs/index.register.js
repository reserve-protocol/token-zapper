"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOneInchDexAggregator = exports.DexAggregator = exports.setupEthereumZapper = exports.ethereumConfig = exports.Universe = exports.Searcher = exports.configuration = exports.TokenQuantity = exports.Token = exports.Address = void 0;
var Address_1 = require("./base/Address");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return Address_1.Address; } });
var Token_1 = require("./entities/Token");
Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return Token_1.Token; } });
Object.defineProperty(exports, "TokenQuantity", { enumerable: true, get: function () { return Token_1.TokenQuantity; } });
const loadTokens_1 = require("./configuration/loadTokens");
const ChainConfiguration_1 = require("./configuration/ChainConfiguration");
exports.configuration = {
    utils: {
        loadTokens: loadTokens_1.loadTokens,
    },
    makeConfig: ChainConfiguration_1.makeConfig,
};
var Searcher_1 = require("./searcher/Searcher");
Object.defineProperty(exports, "Searcher", { enumerable: true, get: function () { return Searcher_1.Searcher; } });
var Universe_1 = require("./Universe");
Object.defineProperty(exports, "Universe", { enumerable: true, get: function () { return Universe_1.Universe; } });
var ethereum_1 = require("./configuration/ethereum");
Object.defineProperty(exports, "ethereumConfig", { enumerable: true, get: function () { return ethereum_1.ethereumConfig; } });
var setupEthereumZapper_1 = require("./configuration/setupEthereumZapper");
Object.defineProperty(exports, "setupEthereumZapper", { enumerable: true, get: function () { return setupEthereumZapper_1.setupEthereumZapper; } });
var oneInchRegistry_1 = require("./aggregators/oneInch/oneInchRegistry");
Object.defineProperty(exports, "DexAggregator", { enumerable: true, get: function () { return oneInchRegistry_1.DexAggregator; } });
Object.defineProperty(exports, "createOneInchDexAggregator", { enumerable: true, get: function () { return oneInchRegistry_1.createOneInchDexAggregator; } });
//# sourceMappingURL=index.register.js.map