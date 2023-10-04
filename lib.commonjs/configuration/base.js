"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_CONFIGS = exports.ethereumConfig = exports.RTOKENS = exports.COMMON_TOKENS = void 0;
const ChainConfiguration_1 = require("./ChainConfiguration");
exports.COMMON_TOKENS = {
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    DAI: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    WETH: '0x4200000000000000000000000000000000000006',
    ERC20GAS: '0x4200000000000000000000000000000000000006'
};
exports.RTOKENS = {
    eUSD: {
        main: '0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a',
        erc20: "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F"
    }
};
exports.ethereumConfig = (0, ChainConfiguration_1.makeConfig)(8453, {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
}, exports.COMMON_TOKENS, exports.RTOKENS, {
    facadeAddress: "0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C",
    zapperAddress: '0x8cE5ee761fF619c889F007CB4D708178E87C11D8',
    executorAddress: '0xe18a821ea1f1796A0797CEa01A3f86ebEab0f9B6',
});
exports.PROTOCOL_CONFIGS = {
    chainLinkRegistry: "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf",
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
            '0x7713DD9Ca933848F6819F38B8352D9A15EA73F67'
        ],
        collaterals: {
            "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643": [
                "0x3043be171e846c33D5f06864Cc045d9Fc799aF52"
            ]
        }
    },
    fluxFinance: {
        comptroller: '0x95Af143a021DF745bc78e845b54591C53a8B3A51',
        markets: [
            '0x1dD7950c266fB1be96180a8FDb0591F70200E018',
            '0x465a5a630482f3abD6d3b84B39B29b07214d19e5',
            '0xe2bA8693cE7474900A045757fe0efCa900F6530b',
            '0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7',
            '0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B'
        ],
        collaterals: {
            "0x465a5a630482f3abD6d3b84B39B29b07214d19e5": [
                "0x6D05CB2CB647B58189FA16f81784C05B4bcd4fe9"
            ]
        }
    },
    rocketPool: {
        reth: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        router: '0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C'
    },
    lido: {
        steth: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
        wsteth: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
    },
    convex: {
        booster: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31"
    },
    erc4626: [
        "0x83F20F44975D03b1b09e64809B757c47f942BEeA",
        "0xaA91d24c2F7DBb6487f61869cD8cd8aFd5c5Cab2",
        "0x7f7B77e49d5b30445f222764a794AFE14af062eB",
        "0xE2b16e14dB6216e33082D5A8Be1Ef01DF7511bBb",
        "0x291ed25eB61fcc074156eE79c5Da87e5DA94198F",
        "0x97F9d5ed17A0C99B279887caD5254d15fb1B619B",
        "0x7f7B77e49d5b30445f222764a794AFE14af062eB"
    ],
    compoundV3: {
        markets: [
            {
                baseToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                receiptToken: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
                vaults: [
                    "0x7e1e077b289c0153b5ceAD9F264d66215341c9Ab" // Reserve wrapped cUSDCV3
                ]
            }
        ]
    },
};
//# sourceMappingURL=base.js.map