import { constants } from 'ethers';
import { Address } from '../base/Address';
export const ChainIds = {
    Mainnet: 1,
    Base: 8453,
    Arbitrum: 42161,
};
export const isChainIdSupported = (chainId) => {
    return Object.values(ChainIds).includes(chainId);
};
const makeAddressMap = (mappings) => {
    return Object.fromEntries(Object.entries(mappings).map(([chainId, address]) => [
        parseInt(chainId),
        address ? Address.from(address) : null,
    ]));
};
/**
 * Protocol related contracts
 */
export const DEPLOYER_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x43587CAA7dE69C3c2aD0fb73D4C9da67A8E35b0b',
    [ChainIds.Base]: '0x9C75314AFD011F22648ca9C655b61674e27bA4AC',
    [ChainIds.Arbitrum]: '0xfd7eb6B208E1fa7B14E26A1fb10fFC17Cf695d68',
});
export const FACADE_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x2815c24F49D5c5316Ffd0952dB0EFe68b0d5F132',
    [ChainIds.Base]: '0xDf99ccA98349DeF0eaB8eC37C1a0B270de38E682',
    [ChainIds.Arbitrum]: '0x15175d35F3d88548B49600B4ee8067253A2e4e66',
});
export const FACADE_ACT_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x801fF27bacc7C00fBef17FC901504c79D59E845C',
    [ChainIds.Base]: '0x3d6D679c863858E89e35c925F937F5814ca687F3',
    [ChainIds.Arbitrum]: '0xE774CCF1431c3DEe7Fa4c20f67534b61289CAa45',
});
export const FACADE_WRITE_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x3312507BC3F22430B34D5841A472c767DC5C36e4',
    [ChainIds.Base]: '0x46c600CB3Fb7Bf386F8f53952D64aC028e289AFb',
    [ChainIds.Arbitrum]: '0xe2B652E538543d02f985A5E422645A704633956d',
});
/**
 * ERC20 token addresses
 */
export const RSR_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
    [ChainIds.Base]: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
    [ChainIds.Arbitrum]: '0xCa5Ca9083702c56b481D1eec86F1776FDbd2e594',
});
export const EUSD_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    [ChainIds.Base]: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
    [ChainIds.Arbitrum]: '0x12275DCB9048680c4Be40942eA4D92c74C63b844',
});
export const RGUSD_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x78da5799CF427Fee11e9996982F4150eCe7a99A7',
    [ChainIds.Arbitrum]: '0x96a993f06951b01430523d0d5590192d650ebf3e',
});
export const ETHPLUS_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    [ChainIds.Arbitrum]: '0x18c14c2d707b2212e17d1579789fc06010cfca23',
});
/**
 * Other contract addresses
 */
export const ENS_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
});
/**
 * Rewards addresses
 */
export const STAKE_AAVE_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
});
export const COMP_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    [ChainIds.Base]: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
});
export const CRV_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
});
export const CVX_ADDRESS = makeAddressMap({
    [ChainIds.Mainnet]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
});
export const STG_ADDRESS = makeAddressMap({
    [ChainIds.Base]: '0xE3B53AF74a4BF62Ae5511055290838050bf764Df',
});
export const getAddressesForChain = (chainId) => {
    if (!isChainIdSupported(chainId))
        throw new Error(`Unsupported chainId: ${chainId}`);
    const addresses = {
        DEPLOYER_ADDRESS: DEPLOYER_ADDRESS[chainId],
        FACADE_ADDRESS: FACADE_ADDRESS[chainId],
        FACADE_ACT_ADDRESS: FACADE_ACT_ADDRESS[chainId],
        FACADE_WRITE_ADDRESS: FACADE_WRITE_ADDRESS[chainId],
        RSR_ADDRESS: RSR_ADDRESS[chainId],
        EUSD_ADDRESS: EUSD_ADDRESS[chainId],
        RGUSD_ADDRESS: RGUSD_ADDRESS[chainId],
        ETHPLUS_ADDRESS: ETHPLUS_ADDRESS[chainId],
        ENS_ADDRESS: ENS_ADDRESS[chainId],
        STAKE_AAVE_ADDRESS: STAKE_AAVE_ADDRESS[chainId],
        COMP_ADDRESS: COMP_ADDRESS[chainId],
        CRV_ADDRESS: CRV_ADDRESS[chainId],
        CVX_ADDRESS: CVX_ADDRESS[chainId],
        STG_ADDRESS: STG_ADDRESS[chainId],
    };
    const getFieldAsStrigOrZero = (key) => addresses[key]?.address ?? constants.AddressZero;
    const strGetters = new Proxy({}, {
        get: (_, key) => {
            if (key === 'config')
                return addresses;
            return getFieldAsStrigOrZero(key);
        },
    });
    return strGetters;
};
//# sourceMappingURL=ReserveAddresses.js.map