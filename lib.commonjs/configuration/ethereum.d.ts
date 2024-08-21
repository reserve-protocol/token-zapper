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
    readonly pyUSD: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
    readonly apxETH: "0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6";
    readonly pxETH: "0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6";
    readonly sUSDe: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
    readonly aEthPYUSD: "0x0C0d01AbF3e6aDfcA0989eBbA9d6e85dD58EaB1E";
    readonly saEthPyUSD: "0x1576B2d7ef15a2ebE9C22C8765DD9c1EfeA8797b";
    readonly steakPYUSD: "0xbEEF02e5E13584ab96848af90261f0C8Ee04722a";
    readonly reth: "0xae78736Cd615f374D3085123A210448E74Fc6393";
    readonly steth: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
    readonly wsteth: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
    readonly cbeth: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
    readonly frxeth: "0x5E8422345238F34275888049021821E8E08CAa1f";
    readonly sfrxeth: "0xac3E018457B222d93114458476f3E3416Abbe38F";
};
export declare const RTOKENS: {
    readonly eUSD: "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F";
    readonly 'ETH+': "0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8";
    readonly hyUSD: "0xaCdf0DBA4B9839b96221a8487e9ca660a48212be";
    readonly RSD: "0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E";
    readonly iUSD: "0x9b451BEB49a03586e6995E5A93b9c745D068581e";
    readonly 'USDC+': "0xFc0B1EEf20e4c68B3DCF36c4537Cfa7Ce46CA70b";
    readonly USD3: "0x0d86883faf4ffd7aeb116390af37746f45b6f378";
    readonly rgUSD: "0x78da5799cf427fee11e9996982f4150ece7a99a7";
    readonly dgnETH: "0x005f893ecd7bf9667195642f7649da8163e23658";
};
export declare const ethereumConfig: {
    readonly requoteTolerance: number;
    readonly routerDeadline: number;
    readonly searcherMinRoutesToProduce: number;
    readonly searcherMaxRoutesToProduce: number;
    readonly searchConcurrency: number;
    readonly defaultInternalTradeSlippage: bigint;
    readonly maxSearchTimeMs: number;
    readonly zapMaxValueLoss: number;
    readonly zapMaxDustProduced: number;
    readonly blocktime: 12000;
    readonly blockGasLimit: bigint;
    readonly simulateZapTransaction?: import("./ZapSimulation").SimulateZapTransactionFunction | undefined;
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
            readonly pyUSD: import("..").Address;
            readonly apxETH: import("..").Address;
            readonly pxETH: import("..").Address;
            readonly sUSDe: import("..").Address;
            readonly aEthPYUSD: import("..").Address;
            readonly saEthPyUSD: import("..").Address;
            readonly steakPYUSD: import("..").Address;
            readonly reth: import("..").Address;
            readonly steth: import("..").Address;
            readonly wsteth: import("..").Address;
            readonly cbeth: import("..").Address;
            readonly frxeth: import("..").Address;
            readonly sfrxeth: import("..").Address;
        };
        readonly rTokens: {
            readonly eUSD: import("..").Address;
            readonly 'ETH+': import("..").Address;
            readonly hyUSD: import("..").Address;
            readonly RSD: import("..").Address;
            readonly iUSD: import("..").Address;
            readonly 'USDC+': import("..").Address;
            readonly USD3: import("..").Address;
            readonly rgUSD: import("..").Address;
            readonly dgnETH: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly oldFacadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly emitId: import("..").Address;
        readonly zapperAddress: import("..").Address;
        readonly wrappedNative: import("..").Address;
        readonly rtokenLens: import("..").Address;
        readonly balanceOf: import("..").Address;
        readonly curveRouterCall: import("..").Address;
        readonly ethBalanceOf: import("..").Address;
        readonly uniV3Router: import("..").Address;
        readonly curveStableSwapNGHelper: import("..").Address;
        readonly curveCryptoFactoryHelper: import("..").Address;
    };
};
export declare const PROTOCOL_CONFIGS: {
    chainLinkRegistry: string;
    frxETH: {
        minter: string;
        sfrxeth: string;
        frxeth: string;
        frxethOracle: string;
    };
    curve: {
        allowedTradeInputs: {
            USDC: string;
            USDT: string;
            DAI: string;
            WBTC: string;
            WETH: string;
            MIM: string;
            FRAX: string;
            crvUSD: string;
            pyUSD: string;
            reth: string;
            steth: string;
            wsteth: string;
            cbeth: string;
            frxeth: string;
            sfrxeth: string;
        };
        allowedTradeOutput: {
            USDC: string;
            USDT: string;
            DAI: string;
            WBTC: string;
            WETH: string;
            pyUSD: string;
            reth: string;
            steth: string;
            wsteth: string;
            cbeth: string;
            frxeth: string;
            sfrxeth: string;
        };
        specialCases: {
            pool: string;
            type: 'factory-crypto' | 'ngPool';
        }[];
    };
    convex: {
        boosterAddress: string;
        wrappers: {
            stkcvx3Pool: string;
            stkcvxPayPool: string;
            stkcvxMIM3Pool: string;
            stkcvxCrvUSDUSDC: string;
            stkcvxCrvUSDUSDT: string;
            'stkcvxETH+ETH-f': string;
            stkcvxPYUSDUSDC: string;
            'stkcvxeUSD3CRV-f': string;
            'stkcvxeUSD3CRV-f2': string;
            'stkcvxeUSD3CRV-f3': string;
            'stkcvxeUSD3CRV-f4': string;
            'stkcvxMIM-3LP3CRV-f': string;
            stkcvx3Crv: string;
        };
    };
    aavev2: {
        pool: string;
        wrappers: string[];
    };
    compoundV2: {
        comptroller: string;
        wrappers: string[];
    };
    fluxFinance: {
        comptroller: string;
        wrappers: string[];
    };
    rocketPool: {
        reth: string;
        router: string;
    };
    lido: {
        steth: string;
        wsteth: string;
    };
    erc4626: string[][];
    aaveV3: {
        pool: string;
        wrappers: string[];
    };
    compV3: {
        comets: string[];
        wrappers: string[];
    };
};
export type EthereumConfigType = typeof ethereumConfig;
export type EthereumUniverse = Universe<EthereumConfigType>;
