"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRTokens = exports.loadRToken = void 0;
const RTokens_1 = require("../action/RTokens");
const loadRToken = async (universe, rTokenAddress) => {
    const rToken = await universe.getToken(rTokenAddress);
    const facade = universe.config.addresses.facadeAddress;
    const rtokenDeployment = await RTokens_1.RTokenDeployment.load(universe, facade, rToken);
    universe.defineMintable(rtokenDeployment.mint, rtokenDeployment.burn, true);
    return rtokenDeployment;
};
exports.loadRToken = loadRToken;
const loadRTokens = (universe) => Promise.all(Object.keys(universe.config.addresses.rTokens).map(async (key) => {
    const rTokenAddress = universe.config.addresses.rTokens[key];
    await (0, exports.loadRToken)(universe, rTokenAddress);
}));
exports.loadRTokens = loadRTokens;
//# sourceMappingURL=setupRTokens.js.map