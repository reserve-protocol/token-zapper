"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRETH = void 0;
const REth_1 = require("../action/REth");
const Address_1 = require("../base/Address");
const setupRETH = async (universe, rethAddress, rethRouterAddress) => {
    const reth = await universe.getToken(Address_1.Address.from(rethAddress));
    const rethRouter = new REth_1.REthRouter(universe, reth, Address_1.Address.from(rethRouterAddress));
    const ethToREth = new REth_1.ETHToRETH(universe, rethRouter);
    const rEthtoEth = new REth_1.RETHToETH(universe, rethRouter);
    universe.defineMintable(ethToREth, rEthtoEth, true);
};
exports.setupRETH = setupRETH;
//# sourceMappingURL=setupRETH.js.map