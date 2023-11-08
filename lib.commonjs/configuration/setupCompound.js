"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCompoundLike = exports.loadCompoundMarketsFromRPC = void 0;
const CTokens_1 = require("../action/CTokens");
const CTokenWrapper_1 = require("../action/CTokenWrapper");
const IComptroller__factory_1 = require("../contracts/factories/contracts/ICToken.sol/IComptroller__factory");
const ICToken__factory_1 = require("../contracts/factories/contracts/ICToken.sol/ICToken__factory");
const setupMintableWithRate_1 = require("./setupMintableWithRate");
const loadCompoundMarketsFromRPC = async (comptrollerAddress, universe) => {
    const allCTokens = await IComptroller__factory_1.IComptroller__factory.connect(comptrollerAddress.address, universe.provider).getAllMarkets();
    return allCTokens;
};
exports.loadCompoundMarketsFromRPC = loadCompoundMarketsFromRPC;
const ONE = 10n ** 18n;
async function setupCompoundLike(universe, deployment, cTokens) {
    const ETH = universe.nativeToken;
    const cETH = deployment.cEth;
    if (cETH != null) {
        await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, ICToken__factory_1.ICToken__factory, cETH, async (cEthRate, cInst) => {
            return {
                fetchRate: async () => (await cInst.callStatic.exchangeRateCurrent()).toBigInt(),
                mint: new CTokens_1.MintCTokenAction(universe, ETH, cETH, cEthRate),
                burn: new CTokens_1.BurnCTokenAction(universe, ETH, cETH, cEthRate),
            };
        });
    }
    for (const { wrappedToken, underlying, collaterals } of cTokens) {
        await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, ICToken__factory_1.ICToken__factory, wrappedToken, async (rate, inst) => {
            return {
                fetchRate: async () => (await inst.callStatic.exchangeRateCurrent()).toBigInt(),
                mint: new CTokens_1.MintCTokenAction(universe, underlying, wrappedToken, rate),
                burn: new CTokens_1.BurnCTokenAction(universe, underlying, wrappedToken, rate),
            };
        });
        for (const collateral of collaterals ?? []) {
            universe.defineMintable(new CTokenWrapper_1.MintCTokenWrapperAction(universe, wrappedToken, collateral, async () => ONE), new CTokenWrapper_1.BurnCTokenWrapperAction(universe, wrappedToken, collateral, async () => ONE));
        }
    }
    return cTokens;
}
exports.setupCompoundLike = setupCompoundLike;
//# sourceMappingURL=setupCompound.js.map