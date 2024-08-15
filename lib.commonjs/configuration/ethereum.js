"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_CONFIGS = exports.ethereumConfig = exports.RTOKENS = exports.COMMON_TOKENS = void 0;
const ChainConfiguration_1 = require("./ChainConfiguration");
const ReserveAddresses_1 = require("./ReserveAddresses");
const chainId = ReserveAddresses_1.ChainIds.Mainnet;
exports.COMMON_TOKENS = {
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
    'stkcvxeUSD3CRV-f3': '0x8e33D5aC344f9F2fc1f2670D45194C280d4fBcF1',
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
    pyUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    apxETH: '0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6',
    pxETH: "0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6",
    sUSDe: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
    aEthPYUSD: '0x0C0d01AbF3e6aDfcA0989eBbA9d6e85dD58EaB1E',
    saEthPyUSD: '0x1576B2d7ef15a2ebE9C22C8765DD9c1EfeA8797b',
    steakPYUSD: '0xbEEF02e5E13584ab96848af90261f0C8Ee04722a',
    reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    steth: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    wsteth: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    cbeth: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    frxeth: '0x5E8422345238F34275888049021821E8E08CAa1f',
    sfrxeth: '0xac3E018457B222d93114458476f3E3416Abbe38F',
    wstethRethSfrxethBalancerLp: "0x42ED016F826165C2e5976fe5bC3df540C5aD0Af7"
};
exports.RTOKENS = {
    eUSD: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    'ETH+': '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    hyUSD: '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be',
    RSD: '0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E',
    iUSD: '0x9b451BEB49a03586e6995E5A93b9c745D068581e',
    'USDC+': '0xFc0B1EEf20e4c68B3DCF36c4537Cfa7Ce46CA70b',
    USD3: '0x0d86883faf4ffd7aeb116390af37746f45b6f378',
    rgUSD: '0x78da5799cf427fee11e9996982f4150ece7a99a7',
    dgnETH: '0x005f893ecd7bf9667195642f7649da8163e23658',
};
exports.ethereumConfig = (0, ChainConfiguration_1.makeConfig)(chainId, {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
}, exports.COMMON_TOKENS, exports.RTOKENS, {
    emitId: "0x6d92146F63d95BF38eB6158856f95139B15C66Bb",
    facadeAddress: '0x2C7ca56342177343A2954C250702Fd464f4d0613',
    oldFacadeAddress: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
    zapperAddress: '0xcc2b9b55952718b210660b56ca12eb88694dc60f',
    executorAddress: '0x675D37489A7A64c051D0204e5c72a469f6558a47',
    wrappedNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    rtokenLens: '0xE787491314A3Da6412Ac4DeEB39c0F8EfdE1b53C',
    balanceOf: '0x6e0A0e7e63ce9622c769655B6733CEcC5AA4038D',
    curveRouterCall: '0xA18ad6dCb6B217A4c3810f865f5eEf45570024dc',
    ethBalanceOf: '0x69b27d52aF3E1012AfcB97BC77B83A7620ABB092',
    uniV3Router: '0x32F59e2881e1DC9a808DE8C37545FE33F2B617A9',
    curveStableSwapNGHelper: '0xb543FD28b0588d0ED317ab746a537840212A95ed',
    curveCryptoFactoryHelper: '0xf4fe93bb762A0b890B08C96FE99a6F405c44B360',
}, {
    blocktime: 12000,
    blockGasLimit: 30000000n,
    requoteTolerance: 1,
});
exports.PROTOCOL_CONFIGS = {
    chainLinkRegistry: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf',
    frxETH: {
        minter: '0xbAFA44EFE7901E04E39Dad13167D089C559c1138',
        sfrxeth: '0xac3E018457B222d93114458476f3E3416Abbe38F',
        frxeth: '0x5E8422345238F34275888049021821E8E08CAa1f',
        frxethOracle: '0xc58f3385fbc1c8ad2c0c9a061d7c13b141d7a5df',
    },
    curve: {
        allowedTradeInputs: {
            USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
            WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            MIM: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
            FRAX: '0x853d955acef822db058eb8505911ed77f175b99e',
            crvUSD: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
            pyUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
            reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
            steth: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
            wsteth: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
            cbeth: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
            frxeth: '0x5E8422345238F34275888049021821E8E08CAa1f',
            sfrxeth: '0xac3E018457B222d93114458476f3E3416Abbe38F',
        },
        allowedTradeOutput: {
            USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
            WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            pyUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
            reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
            steth: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
            wsteth: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
            cbeth: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
            frxeth: '0x5E8422345238F34275888049021821E8E08CAa1f',
            sfrxeth: '0xac3E018457B222d93114458476f3E3416Abbe38F',
        },
        // Tells setupCurve.ts to not use the generic curve implementation, but use our own
        specialCases: [
            {
                pool: '0x7fb53345f1B21aB5d9510ADB38F7d3590BE6364b',
                type: 'factory-crypto',
            },
            {
                pool: '0x383E6b4437b59fff47B619CBA855CA29342A8559',
                type: 'ngPool',
            },
        ],
    },
    convex: {
        boosterAddress: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
        wrappers: {
            stkcvx3Pool: '0x24CDc6b4Edd3E496b7283D94D93119983A61056a',
            stkcvxPayPool: '0x511daB8150966aFfE15F0a5bFfBa7F4d2b62DEd4',
            stkcvxMIM3Pool: '0x3e8f7EDc03E0133b95EcB4dD2f72B5027E695413',
            stkcvxCrvUSDUSDC: '0x6ad24C0B8fD4B594C6009A7F7F48450d9F56c6b8',
            stkcvxCrvUSDUSDT: '0x5d1B749bA7f689ef9f260EDC54326C48919cA88b',
            'stkcvxETH+ETH-f': '0xDbC0cE2321B76D3956412B36e9c0FA9B0fD176E7',
            stkcvxPYUSDUSDC: '0x6Cd8b88Dd65B004A82C33276C7AD3Fd4F569e254',
            'stkcvxeUSD3CRV-f': '0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3',
            'stkcvxeUSD3CRV-f2': '0x3BECE5EC596331033726E5C6C188c313Ff4E3fE5',
            'stkcvxeUSD3CRV-f3': '0x8e33D5aC344f9F2fc1f2670D45194C280d4fBcF1',
            'stkcvxeUSD3CRV-f4': '0x81697e25DFf8564d9E0bC6D27edb40006b34ea2A',
            'stkcvxMIM-3LP3CRV-f': '0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6',
            stkcvx3Crv: '0xee0ac49885719DBF5FC1CDAFD9c752127E009fFa',
        },
    },
    aavev2: {
        pool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
        wrappers: [
            '0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9',
            '0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea',
            '0x60C384e226b120d93f3e0F4C502957b2B9C32B15',
            '0xafd16aFdE22D42038223A6FfDF00ee49c8fDa985',
            '0x684AA4faf9b07d5091B88c6e0a8160aCa5e6d17b',
        ],
    },
    compoundV2: {
        comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
        wrappers: [
            '0x3043be171e846c33D5f06864Cc045d9Fc799aF52',
            '0x4Be33630F92661afD646081BC29079A38b879aA0',
            '0xf579F9885f1AEa0d3F8bE0F18AfED28c92a43022',
        ],
    },
    fluxFinance: {
        comptroller: '0x95Af143a021DF745bc78e845b54591C53a8B3A51',
        wrappers: ['0x6D05CB2CB647B58189FA16f81784C05B4bcd4fe9'],
    },
    rocketPool: {
        reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        router: '0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C',
    },
    lido: {
        steth: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        wsteth: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    },
    erc4626: [
        ['0x83F20F44975D03b1b09e64809B757c47f942BEeA', 'sdai'],
        ['0xaA91d24c2F7DBb6487f61869cD8cd8aFd5c5Cab2', 'morpho'],
        ['0x7f7B77e49d5b30445f222764a794AFE14af062eB', 'morpho'],
        ['0xE2b16e14dB6216e33082D5A8Be1Ef01DF7511bBb', 'morpho'],
        ['0x291ed25eB61fcc074156eE79c5Da87e5DA94198F', 'morpho'],
        ['0x97F9d5ed17A0C99B279887caD5254d15fb1B619B', 'morpho'],
        [
            '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
            'morpho Steakhouse USDC (steakUSDC)',
        ],
        [
            '0xbEEF02e5E13584ab96848af90261f0C8Ee04722a',
            'morpho Steakhouse PYUSD (steakPYUSD)',
        ],
        ['0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0', 'morpho Re7 WETH (Re7WETH)'],
        [
            '0x2C25f6C25770fFEC5959D34B94Bf898865e5D6b1',
            'morpho Flagship USDT (bbUSDT)',
        ],
        ['0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', 'sUSDe'],
        ['0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6', 'apxETH'],
    ],
    aaveV3: {
        pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        wrappers: [
            '0x093cB4f405924a0C468b43209d5E466F1dd0aC7d',
            '0x1576B2d7ef15a2ebE9C22C8765DD9c1EfeA8797b',
            '0x0aDc69041a2B086f8772aCcE2A754f410F211bed',
        ],
    },
    compV3: {
        comets: [
            '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // "USDC"
            '0xA17581A9E3356d9A858b789D68B4d866e593aE94', // WETH
        ],
        wrappers: [
            // wrapped cUSDCV3
            '0x7e1e077b289c0153b5ceAD9F264d66215341c9Ab',
            '0x093c07787920eB34A0A0c7a09823510725Aee4Af',
            '0xfbd1a538f5707c0d67a16ca4e3fc711b80bd931a',
            '0x27F2f159Fe990Ba83D57f39Fd69661764BEbf37a', // <- latest
            // ^ wrapped cUSDCV3
        ],
    },
};
//# sourceMappingURL=ethereum.js.map