import { makeConfig } from './ChainConfiguration';
export const COMMON_TOKENS = {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
    WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ERC20GAS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    MIM: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
    FRAX: '0x853d955acef822db058eb8505911ed77f175b99e',
    'eUSD3CRV-f': '0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F',
    'MIM-3LP3CRV-f': '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
    '3CRV': '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    'stkcvxeUSD3CRV-f': '0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3',
    'stkcvxeUSD3CRV-f2': '0x3BECE5EC596331033726E5C6C188c313Ff4E3fE5',
    'stkcvxMIM-3LP3CRV-f': '0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6',
    stkcvx3Crv: '0xee0ac49885719DBF5FC1CDAFD9c752127E009fFa',
    cBAT: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
    cDAI: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
    cREP: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
    cUSDC: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
    cUSDT: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
    cWBTC: '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
    cZRX: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
    cUNI: '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
    cCOMP: '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
    cTUSD: '0x12392F67bdf24faE0AF363c24aC620a2f67DAd86',
    cLINK: '0xFAce851a4921ce59e912d19329929CE6da6EB0c7',
    cMKR: '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b',
    cSUSHI: '0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7',
    cAAVE: '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
    cYFI: '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946',
    cUSDP: '0x041171993284df560249B57358F931D9eB7b925D',
    cFEI: '0x7713DD9Ca933848F6819F38B8352D9A15EA73F67',
    fOUSG: '0x1dD7950c266fB1be96180a8FDb0591F70200E018',
    fUSDC: '0x465a5a630482f3abD6d3b84B39B29b07214d19e5',
    fDAI: '0xe2bA8693cE7474900A045757fe0efCa900F6530b',
    fUSDT: '0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7',
    fFRAX: '0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B',
    saUSDT: '0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9',
    saDAI: '0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea',
    saUSDC: '0x60C384e226b120d93f3e0F4C502957b2B9C32B15',
    reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
};
export const RTOKENS = {
    eUSD: {
        main: '0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a',
        erc20: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    },
    'ETH+': {
        main: '0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2',
        erc20: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    },
    hyUSD: {
        main: '0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37',
        erc20: '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be',
    },
    RSD: {
        main: '0xa410AA8304CcBD53F88B4a5d05bD8fa048F42478',
        erc20: '0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E',
    },
    iUSD: {
        main: '0x555143D2E6653c80a399f77c612D33D5Bf67F331',
        erc20: '0x9b451BEB49a03586e6995E5A93b9c745D068581e',
    },
    'USDC+': {
        main: '0xeC11Cf537497141aC820615F4f399be4a1638Af6',
        erc20: '0xFc0B1EEf20e4c68B3DCF36c4537Cfa7Ce46CA70b',
    },
};
export const ethereumConfig = makeConfig(1, {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
}, COMMON_TOKENS, RTOKENS, {
    facadeAddress: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
    zapperAddress: '0xcc2b9b55952718b210660b56ca12eb88694dc60f',
    executorAddress: '0x675D37489A7A64c051D0204e5c72a469f6558a47',
    wrappedNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    rtokenLens: '0xE787491314A3Da6412Ac4DeEB39c0F8EfdE1b53C',
    balanceOf: '0x6e0A0e7e63ce9622c769655B6733CEcC5AA4038D',
    curveRouterCall: '0xA18ad6dCb6B217A4c3810f865f5eEf45570024dc',
    ethBalanceOf: '0x69b27d52aF3E1012AfcB97BC77B83A7620ABB092',
});
export const PROTOCOL_CONFIGS = {
    chainLinkRegistry: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf',
    aavev2: {
        tokenWrappers: [
            '0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9',
            '0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea',
            '0x60C384e226b120d93f3e0F4C502957b2B9C32B15',
            '0xafd16aFdE22D42038223A6FfDF00ee49c8fDa985',
        ],
    },
    compound: {
        cEther: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
        markets: [
            '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
            '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
            '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
            '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
            '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
            '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
            '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
            '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
            '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
            '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
            '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
            '0x12392F67bdf24faE0AF363c24aC620a2f67DAd86',
            '0xFAce851a4921ce59e912d19329929CE6da6EB0c7',
            '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b',
            '0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7',
            '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
            '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946',
            '0x041171993284df560249B57358F931D9eB7b925D',
            '0x7713DD9Ca933848F6819F38B8352D9A15EA73F67',
        ],
        collaterals: {
            '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': [
                '0x3043be171e846c33D5f06864Cc045d9Fc799aF52',
            ],
            '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9': [
                '0x4Be33630F92661afD646081BC29079A38b879aA0',
            ],
            '0x39AA39c021dfbaE8faC545936693aC917d5E7563': [
                '0xf579F9885f1AEa0d3F8bE0F18AfED28c92a43022',
            ],
        },
    },
    fluxFinance: {
        comptroller: '0x95Af143a021DF745bc78e845b54591C53a8B3A51',
        markets: [
            '0x1dD7950c266fB1be96180a8FDb0591F70200E018',
            '0x465a5a630482f3abD6d3b84B39B29b07214d19e5',
            '0xe2bA8693cE7474900A045757fe0efCa900F6530b',
            '0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7',
            '0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B',
        ],
        collaterals: {
            '0x465a5a630482f3abD6d3b84B39B29b07214d19e5': [
                '0x6D05CB2CB647B58189FA16f81784C05B4bcd4fe9',
            ],
        },
    },
    rocketPool: {
        reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        router: '0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C',
    },
    lido: {
        steth: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        wsteth: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    },
    convex: {
        booster: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
    },
    erc4626: [
        '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
        '0xaA91d24c2F7DBb6487f61869cD8cd8aFd5c5Cab2',
        '0x7f7B77e49d5b30445f222764a794AFE14af062eB',
        '0xE2b16e14dB6216e33082D5A8Be1Ef01DF7511bBb',
        '0x291ed25eB61fcc074156eE79c5Da87e5DA94198F',
        '0x97F9d5ed17A0C99B279887caD5254d15fb1B619B',
    ],
    aavev3: {
        tokenWrappers: ['0x093cB4f405924a0C468b43209d5E466F1dd0aC7d'],
    },
    compoundV3: {
        markets: [
            {
                baseToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
                receiptToken: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // cUSDCv3
                vaults: [
                    '0x7e1e077b289c0153b5ceAD9F264d66215341c9Ab', // Reserve wrapped cUSDCV3
                    '0x093c07787920eB34A0A0c7a09823510725Aee4Af',
                    '0xfbd1a538f5707c0d67a16ca4e3fc711b80bd931a'
                ],
            },
        ],
    },
};
//# sourceMappingURL=ethereum.js.map