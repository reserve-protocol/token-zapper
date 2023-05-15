"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCompoundLike = void 0;
const CTokens_1 = require("../action/CTokens");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const setupMintableWithRate_1 = require("./setupMintableWithRate");
const loadCompoundTokens = async (cEther, comptrollerAddress, universe, underlyingTokens) => {
    const allCTokens = await contracts_1.IComptroller__factory.connect(comptrollerAddress.address, universe.provider).getAllMarkets();
    return await Promise.all(allCTokens
        .map(Address_1.Address.from)
        .filter((address) => (cEther != null ? address !== cEther.address : true))
        .map(async (address) => {
        const [cToken, underlying] = await Promise.all([
            universe.getToken(address),
            universe.getToken(Address_1.Address.from(underlyingTokens[address.address])),
        ]);
        return { underlying, cToken };
    }));
};
async function setupCompoundLike(universe, underlying, deployment) {
    const ETH = universe.nativeToken;
    const cEther = deployment.cEth != null ? await universe.getToken(deployment.cEth) : null;
    if (cEther) {
        await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, contracts_1.ICToken__factory, cEther, async (cEthRate, cInst) => {
            return {
                fetchRate: async () => (await cInst.exchangeRateStored()).toBigInt(),
                mint: new CTokens_1.MintCTokenAction(universe, ETH, cEther, cEthRate),
                burn: new CTokens_1.MintCTokenAction(universe, cEther, ETH, cEthRate),
            };
        });
    }
    const cTokens = await loadCompoundTokens(cEther, deployment.comptroller, universe, underlying);
    for (const { cToken, underlying } of cTokens) {
        await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, contracts_1.ICToken__factory, cToken, async (rate, inst) => {
            return {
                fetchRate: async () => (await inst.exchangeRateStored()).toBigInt(),
                mint: new CTokens_1.MintCTokenAction(universe, underlying, cToken, rate),
                burn: new CTokens_1.BurnCTokenAction(universe, underlying, cToken, rate),
            };
        });
    }
    return cTokens;
}
exports.setupCompoundLike = setupCompoundLike;
//# sourceMappingURL=loadCompound.js.map