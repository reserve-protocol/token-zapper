"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressesForChain = exports.STG_ADDRESS = exports.CVX_ADDRESS = exports.CRV_ADDRESS = exports.COMP_ADDRESS = exports.STAKE_AAVE_ADDRESS = exports.ENS_ADDRESS = exports.ETHPLUS_ADDRESS = exports.RGUSD_ADDRESS = exports.EUSD_ADDRESS = exports.RSR_ADDRESS = exports.FACADE_WRITE_ADDRESS = exports.FACADE_ACT_ADDRESS = exports.FACADE_ADDRESS = exports.DEPLOYER_ADDRESS = exports.isChainIdSupported = exports.ChainIds = void 0;
const ethers_1 = require("ethers");
const Address_1 = require("../base/Address");
exports.ChainIds = {
    Mainnet: 1,
    Base: 8453,
    Arbitrum: 42161,
};
const isChainIdSupported = (chainId) => {
    return Object.values(exports.ChainIds).includes(chainId);
};
exports.isChainIdSupported = isChainIdSupported;
const makeAddressMap = (mappings) => {
    return Object.fromEntries(Object.entries(mappings).map(([chainId, address]) => [
        parseInt(chainId),
        address ? Address_1.Address.from(address) : null,
    ]));
};
/**
 * Protocol related contracts
 */
exports.DEPLOYER_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x43587CAA7dE69C3c2aD0fb73D4C9da67A8E35b0b',
    [exports.ChainIds.Base]: '0x9C75314AFD011F22648ca9C655b61674e27bA4AC',
    [exports.ChainIds.Arbitrum]: '0xfd7eb6B208E1fa7B14E26A1fb10fFC17Cf695d68',
});
exports.FACADE_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x2815c24F49D5c5316Ffd0952dB0EFe68b0d5F132',
    [exports.ChainIds.Base]: '0xDf99ccA98349DeF0eaB8eC37C1a0B270de38E682',
    [exports.ChainIds.Arbitrum]: '0x15175d35F3d88548B49600B4ee8067253A2e4e66',
});
exports.FACADE_ACT_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x801fF27bacc7C00fBef17FC901504c79D59E845C',
    [exports.ChainIds.Base]: '0x3d6D679c863858E89e35c925F937F5814ca687F3',
    [exports.ChainIds.Arbitrum]: '0xE774CCF1431c3DEe7Fa4c20f67534b61289CAa45',
});
exports.FACADE_WRITE_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x3312507BC3F22430B34D5841A472c767DC5C36e4',
    [exports.ChainIds.Base]: '0x46c600CB3Fb7Bf386F8f53952D64aC028e289AFb',
    [exports.ChainIds.Arbitrum]: '0xe2B652E538543d02f985A5E422645A704633956d',
});
/**
 * ERC20 token addresses
 */
exports.RSR_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
    [exports.ChainIds.Base]: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
    [exports.ChainIds.Arbitrum]: '0xCa5Ca9083702c56b481D1eec86F1776FDbd2e594',
});
exports.EUSD_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    [exports.ChainIds.Base]: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
    [exports.ChainIds.Arbitrum]: '0x12275DCB9048680c4Be40942eA4D92c74C63b844',
});
exports.RGUSD_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x78da5799CF427Fee11e9996982F4150eCe7a99A7',
    [exports.ChainIds.Arbitrum]: '0x96a993f06951b01430523d0d5590192d650ebf3e',
});
exports.ETHPLUS_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    [exports.ChainIds.Arbitrum]: '0x18c14c2d707b2212e17d1579789fc06010cfca23',
});
/**
 * Other contract addresses
 */
exports.ENS_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
});
/**
 * Rewards addresses
 */
exports.STAKE_AAVE_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
});
exports.COMP_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    [exports.ChainIds.Base]: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
});
exports.CRV_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
});
exports.CVX_ADDRESS = makeAddressMap({
    [exports.ChainIds.Mainnet]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
});
exports.STG_ADDRESS = makeAddressMap({
    [exports.ChainIds.Base]: '0xE3B53AF74a4BF62Ae5511055290838050bf764Df',
});
const getAddressesForChain = (chainId) => {
    if (!(0, exports.isChainIdSupported)(chainId))
        throw new Error(`Unsupported chainId: ${chainId}`);
    const addresses = {
        DEPLOYER_ADDRESS: exports.DEPLOYER_ADDRESS[chainId],
        FACADE_ADDRESS: exports.FACADE_ADDRESS[chainId],
        FACADE_ACT_ADDRESS: exports.FACADE_ACT_ADDRESS[chainId],
        FACADE_WRITE_ADDRESS: exports.FACADE_WRITE_ADDRESS[chainId],
        RSR_ADDRESS: exports.RSR_ADDRESS[chainId],
        EUSD_ADDRESS: exports.EUSD_ADDRESS[chainId],
        RGUSD_ADDRESS: exports.RGUSD_ADDRESS[chainId],
        ETHPLUS_ADDRESS: exports.ETHPLUS_ADDRESS[chainId],
        ENS_ADDRESS: exports.ENS_ADDRESS[chainId],
        STAKE_AAVE_ADDRESS: exports.STAKE_AAVE_ADDRESS[chainId],
        COMP_ADDRESS: exports.COMP_ADDRESS[chainId],
        CRV_ADDRESS: exports.CRV_ADDRESS[chainId],
        CVX_ADDRESS: exports.CVX_ADDRESS[chainId],
        STG_ADDRESS: exports.STG_ADDRESS[chainId],
    };
    const getFieldAsStrigOrZero = (key) => addresses[key]?.address ?? ethers_1.constants.AddressZero;
    const strGetters = new Proxy({}, {
        get: (_, key) => {
            if (key === 'config')
                return addresses;
            return getFieldAsStrigOrZero(key);
        },
    });
    return strGetters;
};
exports.getAddressesForChain = getAddressesForChain;
//# sourceMappingURL=ReserveAddresses.js.map