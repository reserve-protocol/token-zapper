"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRETH = void 0;
const REth_1 = require("../action/REth");
const Address_1 = require("../base/Address");
const setupRETH = async (universe, config) => {
    const rethAddress = Address_1.Address.from(config.reth);
    const rethRouterAddress = Address_1.Address.from(config.router);
    const reth = await universe.getToken(Address_1.Address.from(rethAddress));
    const rethRouter = new REth_1.REthRouter(universe, reth, Address_1.Address.from(rethRouterAddress));
    const actions = [
        rethRouter.burnToETH,
        rethRouter.burnToWETH,
        rethRouter.mintViaETH,
        rethRouter.mintViaWETH,
    ];
    for (const action of actions) {
        universe.addAction(action, reth.address);
    }
};
exports.setupRETH = setupRETH;
//# sourceMappingURL=setupRETH.js.map