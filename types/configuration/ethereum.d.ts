import { type Universe } from '../Universe';
export declare const COMMON_TOKENS: {
    readonly USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    readonly USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7";
    readonly DAI: "0x6b175474e89094c44da98b954eedeac495271d0f";
    readonly WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
    readonly WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    readonly ERC20GAS: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    readonly MIM: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
    readonly FRAX: "0x853d955acef822db058eb8505911ed77f175b99e";
    readonly 'eUSD3CRV-f': "0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F";
    readonly 'MIM-3LP3CRV-f': "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    readonly '3CRV': "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
    readonly 'stkcvxeUSD3CRV-f': "0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3";
    readonly 'stkcvxeUSD3CRV-f2': "0x3BECE5EC596331033726E5C6C188c313Ff4E3fE5";
    readonly 'stkcvxMIM-3LP3CRV-f': "0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6";
    readonly stkcvx3Crv: "0xee0ac49885719DBF5FC1CDAFD9c752127E009fFa";
    readonly cBAT: "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E";
    readonly cDAI: "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC";
    readonly cREP: "0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1";
    readonly cUSDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563";
    readonly cUSDT: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9";
    readonly cWBTC: "0xccF4429DB6322D5C611ee964527D42E5d685DD6a";
    readonly cZRX: "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407";
    readonly cUNI: "0x35A18000230DA775CAc24873d00Ff85BccdeD550";
    readonly cCOMP: "0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4";
    readonly cTUSD: "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86";
    readonly cLINK: "0xFAce851a4921ce59e912d19329929CE6da6EB0c7";
    readonly cMKR: "0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b";
    readonly cSUSHI: "0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7";
    readonly cAAVE: "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c";
    readonly cYFI: "0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946";
    readonly cUSDP: "0x041171993284df560249B57358F931D9eB7b925D";
    readonly cFEI: "0x7713DD9Ca933848F6819F38B8352D9A15EA73F67";
    readonly fOUSG: "0x1dD7950c266fB1be96180a8FDb0591F70200E018";
    readonly fUSDC: "0x465a5a630482f3abD6d3b84B39B29b07214d19e5";
    readonly fDAI: "0xe2bA8693cE7474900A045757fe0efCa900F6530b";
    readonly fUSDT: "0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7";
    readonly fFRAX: "0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B";
    readonly saUSDT: "0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9";
    readonly saDAI: "0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea";
    readonly saUSDC: "0x60C384e226b120d93f3e0F4C502957b2B9C32B15";
    readonly reth: "0xae78736Cd615f374D3085123A210448E74Fc6393";
};
export declare const RTOKENS: {
    readonly eUSD: {
        readonly main: "0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a";
        readonly erc20: "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F";
    };
    readonly 'ETH+': {
        readonly main: "0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2";
        readonly erc20: "0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8";
    };
    readonly hyUSD: {
        readonly main: "0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37";
        readonly erc20: "0xaCdf0DBA4B9839b96221a8487e9ca660a48212be";
    };
    readonly RSD: {
        readonly main: "0xa410AA8304CcBD53F88B4a5d05bD8fa048F42478";
        readonly erc20: "0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E";
    };
    readonly iUSD: {
        readonly main: "0x555143D2E6653c80a399f77c612D33D5Bf67F331";
        readonly erc20: "0x9b451BEB49a03586e6995E5A93b9c745D068581e";
    };
    readonly 'USDC+': {
        readonly main: "0xeC11Cf537497141aC820615F4f399be4a1638Af6";
        readonly erc20: "0xFc0B1EEf20e4c68B3DCF36c4537Cfa7Ce46CA70b";
    };
};
export declare const ethereumConfig: {
    readonly chainId: 1;
    readonly nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    readonly addresses: {
        readonly commonTokens: {
            readonly USDC: import("..").Address;
            readonly USDT: import("..").Address;
            readonly DAI: import("..").Address;
            readonly WBTC: import("..").Address;
            readonly WETH: import("..").Address;
            readonly ERC20GAS: import("..").Address;
            readonly MIM: import("..").Address;
            readonly FRAX: import("..").Address;
            readonly 'eUSD3CRV-f': import("..").Address;
            readonly 'MIM-3LP3CRV-f': import("..").Address;
            readonly '3CRV': import("..").Address;
            readonly 'stkcvxeUSD3CRV-f': import("..").Address;
            readonly 'stkcvxeUSD3CRV-f2': import("..").Address;
            readonly 'stkcvxMIM-3LP3CRV-f': import("..").Address;
            readonly stkcvx3Crv: import("..").Address;
            readonly cBAT: import("..").Address;
            readonly cDAI: import("..").Address;
            readonly cREP: import("..").Address;
            readonly cUSDC: import("..").Address;
            readonly cUSDT: import("..").Address;
            readonly cWBTC: import("..").Address;
            readonly cZRX: import("..").Address;
            readonly cUNI: import("..").Address;
            readonly cCOMP: import("..").Address;
            readonly cTUSD: import("..").Address;
            readonly cLINK: import("..").Address;
            readonly cMKR: import("..").Address;
            readonly cSUSHI: import("..").Address;
            readonly cAAVE: import("..").Address;
            readonly cYFI: import("..").Address;
            readonly cUSDP: import("..").Address;
            readonly cFEI: import("..").Address;
            readonly fOUSG: import("..").Address;
            readonly fUSDC: import("..").Address;
            readonly fDAI: import("..").Address;
            readonly fUSDT: import("..").Address;
            readonly fFRAX: import("..").Address;
            readonly saUSDT: import("..").Address;
            readonly saDAI: import("..").Address;
            readonly saUSDC: import("..").Address;
            readonly reth: import("..").Address;
        };
        readonly rTokenDeployments: {
            readonly eUSD: import("..").Address;
            readonly 'ETH+': import("..").Address;
            readonly hyUSD: import("..").Address;
            readonly RSD: import("..").Address;
            readonly iUSD: import("..").Address;
            readonly 'USDC+': import("..").Address;
        };
        readonly rTokens: {
            readonly eUSD: import("..").Address;
            readonly 'ETH+': import("..").Address;
            readonly hyUSD: import("..").Address;
            readonly RSD: import("..").Address;
            readonly iUSD: import("..").Address;
            readonly 'USDC+': import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly zapperAddress: import("..").Address;
        readonly wrappedNative: import("..").Address;
        readonly rtokenLens: import("..").Address;
        readonly balanceOf: import("..").Address;
        readonly curveRouterCall: import("..").Address;
        readonly ethBalanceOf: import("..").Address;
    };
};
export declare const PROTOCOL_CONFIGS: {
    chainLinkRegistry: string;
    aavev2: {
        tokenWrappers: string[];
    };
    compound: {
        cEther: string;
        comptroller: string;
        markets: string[];
        collaterals: Record<string, string[]>;
    };
    fluxFinance: {
        comptroller: string;
        markets: string[];
        collaterals: Record<string, string[]>;
    };
    rocketPool: {
        reth: string;
        router: string;
    };
    lido: {
        steth: string;
        wsteth: string;
    };
    convex: {
        booster: string;
    };
    erc4626: string[];
    compoundV3: {
        markets: {
            baseToken: string;
            receiptToken: string;
            vaults: string[];
        }[];
    };
};
export type EthereumConfigType = typeof ethereumConfig;
export type EthereumUniverse = Universe<EthereumConfigType>;
//# sourceMappingURL=ethereum.d.ts.map