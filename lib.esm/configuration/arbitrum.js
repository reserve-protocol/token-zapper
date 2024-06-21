import { ethers } from 'ethers';
import { BTC_TOKEN_ADDRESS, GAS_TOKEN_ADDRESS } from '../base/constants';
import { makeConfig } from './ChainConfiguration';
import { ChainIds, getAddressesForChain } from './ReserveAddresses';
const chainId = ChainIds.Arbitrum;
const reserveAddresses = getAddressesForChain(chainId);
export const COMMON_TOKENS = {
    RSR: reserveAddresses.RSR_ADDRESS,
    eUSD: reserveAddresses.EUSD_ADDRESS,
    'ETH+': reserveAddresses.ETHPLUS_ADDRESS,
    RGUSD: reserveAddresses.RGUSD_ADDRESS,
    ARB: '0x912ce59144191c1204e64559fe8253a0e49e6548',
    USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    DAI: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    ERC20GAS: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    cbETH: '0x1debd73e752beaf79865fd6446b0c970eae7732f',
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
    reth: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WBTC: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    USDM: '0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C',
    WUSDM: '0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812',
    FRAX: '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
    // COMP: reserveAddresses.COMP_ADDRESS,
};
export const RTOKENS = {
    KNOX: '0x0bbf664d46becc28593368c97236faa0fb397595',
    _rTokenWithWUSDM: "0x05d0e5a60251cef203a06b17973c843c8225cc4e"
};
export const arbiConfig = makeConfig(ChainIds.Arbitrum, {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
}, COMMON_TOKENS, RTOKENS, {
    facadeAddress: reserveAddresses.FACADE_ADDRESS,
    oldFacadeAddress: reserveAddresses.FACADE_ADDRESS,
    wrappedNative: COMMON_TOKENS.WETH,
    zapperAddress: '0x39Eb11db86140d5bd0Cc24d411d833e53b0ACAf8',
    executorAddress: '0x59B56F9e965445f007bCc73960F6d0D034562c3e',
    rtokenLens: '0xe49aA049DA204E6dFF4A5AcdbD3935ec782F541f',
    balanceOf: '0xe18a821ea1f1796A0797CEa01A3f86ebEab0f9B6',
    curveRouterCall: '0x8cE5ee761fF619c889F007CB4D708178E87C11D8',
    ethBalanceOf: '0x0326bF8E7efEBAe81898d366c1491D196d143a4C',
    uniV3Router: '0x922eDac4D5c6702192473ec77a294edD834Fb2af',
    curveStableSwapNGHelper: '0x323EB0B5e2a59d5565E59CBEb965f00298d3A2a1',
    curveCryptoFactoryHelper: ethers.constants.AddressZero,
}, {
    blocktime: 250,
    blockGasLimit: 1125899906842624n,
    requoteTolerance: 4,
    routerDeadline: 4000,
    searcherMinRoutesToProduce: 1,
    searcherMaxRoutesToProduce: 8,
    searchConcurrency: 4,
    defaultInternalTradeSlippage: 250n,
});
export const PROTOCOL_CONFIGS = {
    ...{
        oracles: {
            USD: {
                [COMMON_TOKENS.ARB]: '0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6',
                [COMMON_TOKENS.DAI]: '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB',
                [COMMON_TOKENS.USDC]: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
                [COMMON_TOKENS.USDT]: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
                [COMMON_TOKENS.RSR]: '0xcfF9349ec6d027f20fC9360117fef4a1Ad38B488',
                [COMMON_TOKENS.WUSDM]: '0xdC6720c996Fad27256c7fd6E0a271e2A4687eF18',
                [BTC_TOKEN_ADDRESS]: '0xd0C7101eACbB49F3deCcCc166d238410D6D46d57',
                [COMMON_TOKENS.cbETH]: '0xa668682974E3f121185a3cD94f00322beC674275',
                // [COMMON_TOKENS.COMP]: '0xe7C53FFd03Eb6ceF7d208bC4C13446c76d1E5884',
                // [COMMON_TOKENS.CRV]: '0xaebDA2c976cfd1eE1977Eac079B4382acb849325',
                [COMMON_TOKENS.WETH]: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
                [GAS_TOKEN_ADDRESS]: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
                [COMMON_TOKENS.FRAX]: '0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8',
                // [COMMON_TOKENS.STG]: '0xe74d69E233faB0d8F48921f2D93aDfDe44cEb3B7',
            },
            ETH: {
                [COMMON_TOKENS.reth]: '0xD6aB2298946840262FcC278fF31516D39fF611eF',
                [COMMON_TOKENS.wstETH]: '0xb523AE262D20A936BC152e6023996e46FDC2A95D',
            },
            BTC: {
                [COMMON_TOKENS.WBTC]: '0x6ce185860a4963106506C203335A2910413708e9',
            },
        },
        aaveV3: {
            pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
            wrappers: [
                '0x030cDeCBDcA6A34e8De3f49d1798d5f70E3a3414',
                '0xffef97179f58a582dEf73e6d2e4BcD2BDC8ca128',
            ],
        },
        compV3: {
            comets: [
                '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // USDC.e
                '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // USDC
            ],
            wrappers: [
                '0xd54804250e9c561aea9dee34e9cf2342f767acc5', // (wcUSDCv3)
            ],
        },
        erc4626: [['0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812', 'wUSDM']],
    },
};
//# sourceMappingURL=arbitrum.js.map