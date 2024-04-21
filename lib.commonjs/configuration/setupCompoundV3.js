"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCompoundV3 = exports.setupSingleCompoundV3Market = void 0;
const Comet_1 = require("../action/Comet");
const CometWrapper_1 = require("../action/CometWrapper");
const WrappedComet__factory_1 = require("../contracts/factories/contracts/Compv3.sol/WrappedComet__factory");
const setupSingleCompoundV3Market = async (universe, market) => {
    // Define baseToken -> receiptToken
    universe.defineMintable(new Comet_1.MintCometAction(universe, market.baseToken, market.receiptToken), new Comet_1.BurnCometAction(universe, market.baseToken, market.receiptToken));
    // Set up vaults
    for (const vaultToken of market.vaults) {
        const rate = { value: market.baseToken.one.amount };
        const inst = WrappedComet__factory_1.WrappedComet__factory.connect(vaultToken.address.address, universe.provider);
        const updateRate = async () => {
            rate.value = (await inst.callStatic.exchangeRate()).toBigInt();
        };
        await updateRate();
        universe.createRefreshableEntity(vaultToken.address, updateRate);
        const getRate = async () => {
            universe.refresh(vaultToken.address);
            return rate.value;
        };
        universe.defineMintable(new CometWrapper_1.MintCometWrapperAction(universe, market.receiptToken, vaultToken, getRate), new CometWrapper_1.BurnCometWrapperAction(universe, market.receiptToken, vaultToken, getRate));
    }
};
exports.setupSingleCompoundV3Market = setupSingleCompoundV3Market;
const setupCompoundV3 = async (universe, markets) => {
    await Promise.all(markets.map(async (m) => {
        try {
            await (0, exports.setupSingleCompoundV3Market)(universe, m);
        }
        catch (e) {
            console.error(`Failed to setup compound v3 market ${m.baseToken} ${m.receiptToken}`);
            throw e;
        }
    }));
};
exports.setupCompoundV3 = setupCompoundV3;
//# sourceMappingURL=setupCompoundV3.js.map