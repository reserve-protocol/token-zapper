"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLido = void 0;
const StEth_1 = require("../action/StEth");
const WStEth_1 = require("../action/WStEth");
const Address_1 = require("../base/Address");
const setupLido = async (universe, stakedTokenAddress, wrappedStakedAddress) => {
    const stakedToken = await universe.getToken(Address_1.Address.from(stakedTokenAddress));
    const stRate = new StEth_1.StETHRateProvider(universe, stakedToken);
    universe.defineMintable(new StEth_1.MintStETH(universe, stakedToken, stRate), new StEth_1.BurnStETH(universe, stakedToken, stRate), true);
    const wrappedStakedToken = await universe.getToken(Address_1.Address.from(wrappedStakedAddress));
    const wstRate = new WStEth_1.WStETHRateProvider(universe, stakedToken, wrappedStakedToken);
    universe.defineMintable(new WStEth_1.MintWStETH(universe, stakedToken, wrappedStakedToken, wstRate), new WStEth_1.BurnWStETH(universe, stakedToken, wrappedStakedToken, wstRate), true);
};
exports.setupLido = setupLido;
//# sourceMappingURL=setupLido.js.map