"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aTokensEthereum = exports.ycTokensEthereum = exports.yTokensEthereum = exports.cTokensEthereum = exports.COINS_ETHEREUM = void 0;
const utils_1 = require("../utils");
exports.COINS_ETHEREUM = (0, utils_1.lowerCaseValues)({
    crv: "0xD533a949740bb3306d119CC777fa900bA034cd52", // CRV
    // --- USD ---
    '3crv': "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", // 3CRV
    ycdai: "0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc", // pax/yDAI
    ycusdc: "0x9777d7E2b60bB01759D0E2f8be2095df444cb07E", // pax/yUSDC
    ycusdt: "0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59", // pax/yUSDT
    usdp: "0x8E870D67F660D95d5be530380D0eC0bd388289E1", // PAX
    adai: "0x028171bCA77440897B824Ca71D1c56caC55b68A3", // aDAI
    ausdc: "0xBcca60bB61934080951369a648Fb03DF4F96263C", // aUSDC
    ausdt: "0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811", // aUSDT
    asusd: "0x6c5024cd4f8a59110119c56f8933403a539555eb", // aSUSD
    cdai: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
    cusdc: "0x39AA39c021dfbaE8faC545936693aC917d5E7563", // cUSDC
    cydai: "0x8e595470ed749b85c6f7669de83eae304c2ec68f", // cyDAI
    cyusdc: "0x76eb2fe28b36b3ee97f3adae0c69606eedb2a37c", // cyUSDC
    cyusdt: "0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a", // cyUSDT
    bydai: "0xC2cB1040220768554cf699b0d863A3cd4324ce32", // busd/yDAI
    byusdc: "0x26EA744E5B887E5205727f55dFBE8685e3b21951", // busd/yUSDC
    byusdt: "0xE6354ed5bC4b393a5Aad09f21c46E101e692d447", // busd/yUSDT
    ybusd: "0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE", // yBUSD
    ydai: "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01", // y/yDAI
    yusdc: "0xd6aD7a6750A7593E092a9B218d66C0A814a3436e", // y/yUSDC
    yusdt: "0x83f798e925BcD4017Eb265844FDDAbb448f1707D", // y/yUSDT
    ytusd: "0x73a052500105205d34Daf004eAb301916DA8190f", // yTUSD
    gusd: "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd", // GUSD
    husd: "0xdF574c24545E5FfEcb9a659c229253D4111d87e1", // HUSD
    usdk: "0x1c48f86ae57291F7686349F12601910BD8D470bb", // USDK
    musd: "0xe2f2a5C287993345a840Db3B0845fbC70f5935a5", // MUSD
    rsv: "0x196f4727526eA7FB1e17b2071B3d8eAA38486988", // RSV
    dusd: "0x5BC25f649fc4e26069dDF4cF4010F9f706c23831", // DUSD
    ust: "0xa47c8bf37f92abed4a126bda807a7b7498661acd", // UST
    usdn: "0x674C6Ad92Fd080e4004b2312b45f796a192D27a0", // USDN
    dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    susd: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51", // sUSD
    tusd: "0x0000000000085d4780B73119b644AE5ecd22b376", // TUSD
    frax: "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
    lusd: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", // LUSD
    busd: "0x4Fabb145d64652a948d72533023f6E7A623C7C53", // BUSD
    alusd: "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9", // alUSD
    mim: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3", // MIM
    rai: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919", // RAI
    wormholeust: "0xa693B19d2931d498c5B318dF961919BB4aee87a5", // UST
    // --- ETH ---
    steth: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
    eth: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
    ankreth: "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb", // ankrETH
    seth: "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb", // sETH
    reth: "0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593", // rETH
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    frxeth: "0x5E8422345238F34275888049021821E8E08CAa1f", // frxETH
    // --- BTC ---
    sbtccrv: "0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3", // sbtcCRV
    hbtc: "0x0316EB71485b0Ab14103307bf65a021042c6d380", // HBTC
    renbtc: "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D", // renBTC
    wbtc: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    tbtc: "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa", // TBTC
    pbtc: "0x5228a22e72ccC52d415EcFd199F99D0665E7733b", // pBTC
    bbtc: "0x9be89d2a4cd102d8fecc6bf9da793be995c22541", // bBTC
    obtc: "0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68", // oBTC
    sbtc: "0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6", // sBTC
    // --- EUR ---
    eurs: "0xdB25f211AB05b1c97D595516F45794528a807ad8", // EURS
    seur: "0xD71eCFF9342A5Ced620049e616c5035F1dB98620", // sEUR
    eurt: "0xC581b735A1688071A1746c968e0798D642EDE491", // EURT
    euroc: "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c", // EUROC
    // --- LINK ---
    link: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
    slink: "0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6", // sLINK
    // --- OTHER ---
    cvx: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", // CVX
    cvxcrv: "0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7",
    snx: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", // SNX
    spell: "0x090185f2135308bad17527004364ebcc2d37e5f6", // SPELL
    t: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5", // T
    xaut: "0x68749665ff8d2d112fa859aa293f07a622782f38", // XAUt
});
exports.cTokensEthereum = [
    '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI
    '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
    "0x8e595470ed749b85c6f7669de83eae304c2ec68f", // cyDAI
    "0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a", // cyUSDT
    "0x76eb2fe28b36b3ee97f3adae0c69606eedb2a37c", // cyUSDC
].map((a) => a.toLowerCase());
exports.yTokensEthereum = [
    "0xC2cB1040220768554cf699b0d863A3cd4324ce32", // busd/yDAI
    "0x26EA744E5B887E5205727f55dFBE8685e3b21951", // busd/yUSDC
    "0xE6354ed5bC4b393a5Aad09f21c46E101e692d447", // busd/yUSDT
    "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01", // y/yDAI
    "0xd6aD7a6750A7593E092a9B218d66C0A814a3436e", // y/yUSDC
    "0x83f798e925BcD4017Eb265844FDDAbb448f1707D", // y/yUSDT
    "0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE", // yBUSD
    "0x73a052500105205d34Daf004eAb301916DA8190f", // yTUSD
].map((a) => a.toLowerCase());
exports.ycTokensEthereum = [
    "0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc", // ycDAI
    "0x9777d7E2b60bB01759D0E2f8be2095df444cb07E", // ycUSDC
    "0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59", // ycUSDT
].map((a) => a.toLowerCase());
exports.aTokensEthereum = [
    "0x028171bCA77440897B824Ca71D1c56caC55b68A3", // aDAI
    "0xBcca60bB61934080951369a648Fb03DF4F96263C", // aUSDC
    "0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811", // aUSDT
    "0x6c5024cd4f8a59110119c56f8933403a539555eb", // sSUSD
].map((a) => a.toLowerCase());
//# sourceMappingURL=ethereum.js.map