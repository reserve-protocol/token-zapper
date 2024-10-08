"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_CONFIGS = exports.baseConfig = exports.RTOKENS = exports.COMMON_TOKENS = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../base/constants");
const ChainConfiguration_1 = require("./ChainConfiguration");
exports.COMMON_TOKENS = {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    DAI: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    WETH: '0x4200000000000000000000000000000000000006',
    ERC20GAS: '0x4200000000000000000000000000000000000006',
    cbETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    wstETH: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
};
exports.RTOKENS = {
    hyUSD: '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e',
    bsd: '0xcb327b99ff831bf8223cced12b1338ff3aa322ff',
    iUSD: '0xfE0D6D83033e313691E96909d2188C150b834285',
    MATT: '0x641b0453487c9d14c5df96d45a481ef1dc84e31f',
};
exports.baseConfig = (0, ChainConfiguration_1.makeConfig)(8453, {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
}, exports.COMMON_TOKENS, exports.RTOKENS, {
    emitId: '0xC7a942301d92024321995f7f748C2B0687a1Cb60',
    facadeAddress: '0xEb2071e9B542555E90E6e4E1F83fa17423583991',
    oldFacadeAddress: '0xe1aa15DA8b993c6312BAeD91E0b470AE405F91BF',
    zapperAddress: '0xaA560D5C2Fade67CF6836Ab793e56A79F09d4282',
    executorAddress: '0x560740052F380669c90811f711f80B21306d4713',
    wrappedNative: '0x4200000000000000000000000000000000000006',
    rtokenLens: '0x5cF5eD1715b6416710f106A3257E5C55B65EF418',
    balanceOf: '0x9554DBb835886FC1f37835A1C83CeA3c20e5950A',
    curveRouterCall: '0x1A7F7C1b870ad69D19a899B2A3BA6EBEea77033f',
    ethBalanceOf: '0x858b62D160788864c65222d7a3777a19B370Abd8',
    uniV3Router: '0x69b27d52aF3E1012AfcB97BC77B83A7620ABB092',
    curveStableSwapNGHelper: '0xb543FD28b0588d0ED317ab746a537840212A95ed',
    curveCryptoFactoryHelper: ethers_1.ethers.constants.AddressZero,
}, {
    blocktime: 2000,
    blockGasLimit: 60000000n,
    requoteTolerance: 4,
});
exports.PROTOCOL_CONFIGS = {
    usdPriceOracles: {
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': '0x7e860098f58bbfc8648a4311b374b1d669a2bc6b', // USDC/USD
        '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA': '0x7e860098f58bbfc8648a4311b374b1d669a2bc6b', // USDbC/USD
        '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': '0x591e79239a7d679378ec8c847e5038150364c78f', // DAI/USD
        // "": "0xf19d560eb8d2adf07bd6d13ed03e1d11215721f9", // USDT/USD
        [constants_1.GAS_TOKEN_ADDRESS]: '0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70', // ETH/USD
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': '0xd7818272b9e248357d13057aab0b417af31e817d', // cbETH/USD
        // '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452':
        //   '0xf586d0728a47229e747d824a939000Cf21dEF5A0', // wsteth/USD
        // "": "0xccadc697c55bbb68dc5bcdf8d3cbe83cdd4e071e", // WBTC / USD
    },
    ethPriceOracles: {
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': '0x806b4ac04501c29769051e42783cf04dce41440b', // cbETH / ETH
        '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452': '0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061', // wsteth / ETH
    },
    aaveV3: {
        pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
        wrappers: [
            '0x308447562442Cc43978f8274fA722C9C14BafF8b',
            '0x184460704886f9F2A7F3A0c2887680867954dC6E',
            '0x6F6f81e5E66f503184f2202D83a79650c3285759',
        ],
    },
    compV3: {
        comets: {
            CUSDCV3: '0xb125E6687d4313864e53df431d5425969c15Eb2F',
            CUSDbCV3: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
            CWETHV3: '0x46e6b214b524310239732D51387075E0e70970bf', // WETH
        },
        wrappers: [
            '0xbC0033679AEf41Fb9FeB553Fdf55a8Bb2fC5B29e',
            '0xa8d818C719c1034E731Feba2088F4F011D44ACB3',
            '0xa694f7177c6c839c951c74c797283b35d0a486c8',
            '0x53f1Df4E5591Ae35Bf738742981669c3767241FA',
        ],
    },
    stargate: {
        router: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
        wrappers: ['0x073F98792ef4c00bB5f11B1F64f13cB25Cde0d8D'],
        tokens: ['0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA'],
    },
};
//# sourceMappingURL=base.js.map