import { lowerCasePoolDataAddresses } from '../utils'
import { IDict, IPoolData } from '../../interfaces'
import { type JsonFragment } from '@ethersproject/abi'
import gaugeABIJson from '../abis/gauge.json'
import gaugeSynthetixABIJson from '../abis/gauge_synthetix.json'
import gaugeV2ABIJson from '../abis/gauge_v2.json'
import gaugeV3ABIJson from '../abis/gauge_v3.json'
import gaugeV4ABIJson from '../abis/gauge_v4.json'
import gaugeV5ABIJson from '../abis/gauge_v5.json'
import gaugeFactoryABIJson from '../abis/gauge_factory.json'
import compoundDepositABIJson from '../abis/compound/deposit.json'
import compoundSwapABIJson from '../abis/compound/swap.json'
import usdtDepositABIJson from '../abis/usdt/deposit.json'
import usdtSwapABIJson from '../abis/usdt/swap.json'
import busdDepositABIJson from '../abis/busd/deposit.json'
import busdSwapABIJson from '../abis/busd/swap.json'
import susdv2DepositABIJson from '../abis/susdv2/deposit.json'
import susdv2SwapABIJson from '../abis/susdv2/swap.json'
import susdv2SCurveRewardsABIJson from '../abis/susdv2/sCurveRewards.json'
import paxDepositABIJson from '../abis/pax/deposit.json'
import paxSwapABIJson from '../abis/pax/swap.json'
import tripoolSwapABIJson from '../abis/3pool/swap.json'
import usdnSwapABIJson from '../abis/usdn/swap.json'
import usdnDepositABIJson from '../abis/usdn/deposit.json'
import rsvSwapABIJson from '../abis/rsv/swap.json'
import rsvDepositABIJson from '../abis/rsv/deposit.json'
import rsvSCurveRewardsABIJson from '../abis/rsv/sCurveRewards.json'
import dusdSwapABIJson from '../abis/dusd/swap.json'
import dusdDepositABIJson from '../abis/dusd/deposit.json'
import dusdSCurveRewardsABIJson from '../abis/dusd/sCurveRewards.json'
import sethSwapABIJson from '../abis/seth/swap.json'
import ustSwapABIJson from '../abis/ust/swap.json'
import ustDepositABIJson from '../abis/ust/deposit.json'
import stethSwapABIJson from '../abis/steth/swap.json'
import stethSCurveRewardsABIJson from '../abis/steth/sCurveRewards.json'
import ankrethSwapABIJson from '../abis/ankreth/swap.json'
import ankrethSCurveRewardsABIJson from '../abis/ankreth/sCurveRewards.json'
import usdpSwapABIJson from '../abis/usdp/swap.json'
import usdpDepositABIJson from '../abis/usdp/deposit.json'
import ibSwapABIJson from '../abis/ib/swap.json'
import rethSwapABIJson from '../abis/reth/swap.json'
import factorySwapABIJson from '../abis/factoryPools/swap.json'
import factoryDepositABIJson from '../abis/factoryPools/deposit.json'
import factoryRewardsABIJson from '../abis/factoryPools/rewards.json'
import tricrypto2SwapABIJson from '../abis/tricrypto2/swap.json'
import tricrypto2DepositABIJson from '../abis/tricrypto2/deposit.json'
import raiSwapABIJson from '../abis/rai/swap.json'
import raiDepositABIJson from '../abis/rai/deposit.json'
import twopoolSwapABIJson from '../abis/2pool/swap.json'
import fourpoolSwapABIJson from '../abis/4pool/swap.json'
import fraxusdcSwapABIJson from '../abis/fraxusdc/swap.json'
import frxethSwapABIJson from '../abis/frxeth/swap.json'

const gaugeABI = () => Promise.resolve(gaugeABIJson as JsonFragment[])

const gaugeSynthetixABI = () =>
  Promise.resolve(gaugeSynthetixABIJson as JsonFragment[])

const gaugeV2ABI = () => Promise.resolve(gaugeV2ABIJson as JsonFragment[])

const gaugeV3ABI = () => Promise.resolve(gaugeV3ABIJson as JsonFragment[])

const gaugeV4ABI = () => Promise.resolve(gaugeV4ABIJson as JsonFragment[])

const gaugeV5ABI = () => Promise.resolve(gaugeV5ABIJson as JsonFragment[])

const gaugeFactoryABI = () =>
  Promise.resolve(gaugeFactoryABIJson as JsonFragment[])

const compoundDepositABI = () =>
  Promise.resolve(compoundDepositABIJson as JsonFragment[])

const compoundSwapABI = () =>
  Promise.resolve(compoundSwapABIJson as JsonFragment[])

const usdtDepositABI = () =>
  Promise.resolve(usdtDepositABIJson as JsonFragment[])

const usdtSwapABI = () => Promise.resolve(usdtSwapABIJson as JsonFragment[])

const busdDepositABI = () =>
  Promise.resolve(busdDepositABIJson as JsonFragment[])

const busdSwapABI = () => Promise.resolve(busdSwapABIJson as JsonFragment[])

const susdv2DepositABI = () =>
  Promise.resolve(susdv2DepositABIJson as JsonFragment[])

const susdv2SwapABI = () => Promise.resolve(susdv2SwapABIJson as JsonFragment[])

const susdv2SCurveRewards_abi = () =>
  Promise.resolve(susdv2SCurveRewardsABIJson as JsonFragment[])

const paxDepositABI = () => Promise.resolve(paxDepositABIJson as JsonFragment[])

const paxSwapABI = () => Promise.resolve(paxSwapABIJson as JsonFragment[])

const tripoolSwapABI = () =>
  Promise.resolve(tripoolSwapABIJson as JsonFragment[])

const usdnSwapABI = () => Promise.resolve(usdnSwapABIJson as JsonFragment[])

const usdnDepositABI = () =>
  Promise.resolve(usdnDepositABIJson as JsonFragment[])

const rsvSwapABI = () => Promise.resolve(rsvSwapABIJson as JsonFragment[])

const rsvDepositABI = () => Promise.resolve(rsvDepositABIJson as JsonFragment[])

const rsvSCurveRewards_abi = () =>
  Promise.resolve(rsvSCurveRewardsABIJson as JsonFragment[])

const dusdSwapABI = () => Promise.resolve(dusdSwapABIJson as JsonFragment[])

const dusdDepositABI = () =>
  Promise.resolve(dusdDepositABIJson as JsonFragment[])

const dusdSCurveRewards_abi = () =>
  Promise.resolve(dusdSCurveRewardsABIJson as JsonFragment[])

const sethSwapABI = () => Promise.resolve(sethSwapABIJson as JsonFragment[])

const ustSwapABI = () => Promise.resolve(ustSwapABIJson as JsonFragment[])

const ustDepositABI = () => Promise.resolve(ustDepositABIJson as JsonFragment[])

const stethSwapABI = () => Promise.resolve(stethSwapABIJson as JsonFragment[])

const stethSCurveRewards_abi = () =>
  Promise.resolve(stethSCurveRewardsABIJson as JsonFragment[])

const ankrethSwapABI = () =>
  Promise.resolve(ankrethSwapABIJson as JsonFragment[])

const ankrethSCurveRewards_abi = () =>
  Promise.resolve(ankrethSCurveRewardsABIJson as JsonFragment[])

const usdpSwapABI = () => Promise.resolve(usdpSwapABIJson as JsonFragment[])

const usdpDepositABI = () =>
  Promise.resolve(usdpDepositABIJson as JsonFragment[])

const ibSwapABI = () => Promise.resolve(ibSwapABIJson as JsonFragment[])

const rethSwapABI = () => Promise.resolve(rethSwapABIJson as JsonFragment[])

const factorySwapABI = () =>
  Promise.resolve(factorySwapABIJson as JsonFragment[])

const factoryDepositABI = () =>
  Promise.resolve(factoryDepositABIJson as JsonFragment[])

const factoryRewardsABI = () =>
  Promise.resolve(factoryRewardsABIJson as JsonFragment[])

const tricrypto2SwapABI = () =>
  Promise.resolve(tricrypto2SwapABIJson as JsonFragment[])

const tricrypto2DepositABI = () =>
  Promise.resolve(tricrypto2DepositABIJson as JsonFragment[])

const raiSwapABI = () => Promise.resolve(raiSwapABIJson as JsonFragment[])

const raiDepositABI = () => Promise.resolve(raiDepositABIJson as JsonFragment[])

const twopoolSwapABI = () =>
  Promise.resolve(twopoolSwapABIJson as JsonFragment[])

const fourpoolSwapABI = () =>
  Promise.resolve(fourpoolSwapABIJson as JsonFragment[])

const fraxusdcSwapABI = () =>
  Promise.resolve(fraxusdcSwapABIJson as JsonFragment[])

const frxethSwapABI = () => Promise.resolve(frxethSwapABIJson as JsonFragment[])

export const POOLS_DATA_ETHEREUM: IDict<IPoolData> = lowerCasePoolDataAddresses(
  {
    compound: {
      name: 'compound',
      full_name: 'compound',
      symbol: 'compound',
      reference_asset: 'USD',
      swap_address: '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
      token_address: '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2',
      gauge_address: '0x7ca5b0a2910B33e9759DC7dDB0413949071D7575',
      deposit_address: '0xeB21209ae4C2c9FF2a86ACA31E123764A3B6Bc06',
      is_lending: true,
      underlying_coins: ['DAI', 'USDC'],
      wrapped_coins: ['cDAI', 'cUSDC'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ],
      wrapped_coin_addresses: [
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
      ],
      underlying_decimals: [18, 6],
      wrapped_decimals: [8, 8],
      use_lending: [true, true],
      swap_abi: compoundSwapABI,
      gauge_abi: gaugeABI,
      deposit_abi: compoundDepositABI,
    },

    usdt: {
      name: 'usdt',
      full_name: 'usdt',
      symbol: 'usdt',
      reference_asset: 'USD',
      swap_address: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
      token_address: '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23',
      gauge_address: '0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53',
      deposit_address: '0xac795D2c97e60DF6a99ff1c814727302fD747a80',
      is_lending: true,
      underlying_coins: ['DAI', 'USDC', 'USDT'],
      wrapped_coins: ['cDAI', 'cUSDC', 'USDT'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      underlying_decimals: [18, 6, 6],
      wrapped_decimals: [8, 8, 6],
      use_lending: [true, true, false],
      swap_abi: usdtSwapABI,
      gauge_abi: gaugeABI,
      deposit_abi: usdtDepositABI,
    },

    // y: {
    //     name: "y",
    //     full_name: "y",
    //     symbol: "Y",
    //     reference_asset: 'USD',
    //     swap_address: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
    //     token_address: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
    //     gauge_address: '0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1',
    //     deposit_address: '0xbBC81d23Ea2c3ec7e56D39296F0cbB648873a5d3',
    //     // sCurveRewards_address: '0x0001FB050Fe7312791bF6475b96569D83F695C9f',
    //     is_lending: true,
    //     underlying_coins: ['DAI', 'USDC', 'USDT', 'TUSD'],
    //     wrapped_coins: ['yDAI', 'yUSDC', 'yUSDT', 'yTUSD'],
    //     underlying_coin_addresses: [
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //         '0x0000000000085d4780B73119b644AE5ecd22b376',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01',
    //         '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e',
    //         '0x83f798e925BcD4017Eb265844FDDAbb448f1707D',
    //         '0x73a052500105205d34Daf004eAb301916DA8190f',
    //     ],
    //     underlying_decimals: [18, 6, 6, 18],
    //     wrapped_decimals: [18, 6, 6, 18],
    //     use_lending: [true, true, true, true],
    //     swap_abi: iearnSwapABI,
    //     gauge_abi: gaugeABI,
    //     deposit_abi: iearnDepositABI,
    //     // sCurveRewards_abi: iearnSCurveRewardsABI,
    // },
    busd: {
      name: 'busd',
      full_name: 'busd',
      symbol: 'busd',
      reference_asset: 'USD',
      swap_address: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
      token_address: '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B',
      gauge_address: '0x69Fb7c45726cfE2baDeE8317005d3F94bE838840',
      deposit_address: '0xb6c057591E073249F2D9D88Ba59a46CFC9B59EdB',
      is_lending: true,
      underlying_coins: ['DAI', 'USDC', 'USDT', 'BUSD'],
      wrapped_coins: ['byDAI', 'byUSDC', 'byUSDT', 'yBUSD'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      ],
      wrapped_coin_addresses: [
        '0xC2cB1040220768554cf699b0d863A3cd4324ce32',
        '0x26EA744E5B887E5205727f55dFBE8685e3b21951',
        '0xE6354ed5bC4b393a5Aad09f21c46E101e692d447',
        '0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE',
      ],
      underlying_decimals: [18, 6, 6, 18],
      wrapped_decimals: [18, 6, 6, 18],
      use_lending: [true, true, true, true],
      swap_abi: busdSwapABI,
      gauge_abi: gaugeABI,
      deposit_abi: busdDepositABI,
    },

    susd: {
      name: 'susd',
      full_name: 'susd',
      symbol: 'susd',
      reference_asset: 'USD',
      swap_address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
      token_address: '0xC25a3A3b969415c80451098fa907EC722572917F',
      gauge_address: '0xA90996896660DEcC6E997655E065b23788857849',
      deposit_address: '0xFCBa3E75865d2d561BE8D220616520c171F12851',
      sCurveRewards_address: '0xdcb6a51ea3ca5d3fd898fd6564757c7aaec3ca92',
      is_plain: true,
      underlying_coins: ['DAI', 'USDC', 'USDT', 'sUSD'],
      wrapped_coins: ['DAI', 'USDC', 'USDT', 'sUSD'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
      ],
      wrapped_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
      ],
      underlying_decimals: [18, 6, 6, 18],
      wrapped_decimals: [18, 6, 6, 18],
      swap_abi: susdv2SwapABI,
      gauge_abi: gaugeSynthetixABI,
      deposit_abi: susdv2DepositABI,
      sCurveRewards_abi: susdv2SCurveRewards_abi,
    },

    pax: {
      name: 'pax',
      full_name: 'pax',
      symbol: 'pax',
      reference_asset: 'USD',
      swap_address: '0x06364f10B501e868329afBc005b3492902d6C763',
      token_address: '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8',
      gauge_address: '0x64E3C23bfc40722d3B649844055F1D51c1ac041d',
      deposit_address: '0xA50cCc70b6a011CffDdf45057E39679379187287',
      is_lending: true,
      underlying_coins: ['DAI', 'USDC', 'USDT', 'USDP'],
      wrapped_coins: ['ycDAI', 'ycUSDC', 'ycUSDT', 'USDP'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      ],
      wrapped_coin_addresses: [
        '0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc',
        '0x9777d7E2b60bB01759D0E2f8be2095df444cb07E',
        '0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59',
        '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      ],
      underlying_decimals: [18, 6, 6, 18],
      wrapped_decimals: [18, 6, 6, 18],
      use_lending: [true, true, true, false],
      swap_abi: paxSwapABI,
      gauge_abi: gaugeABI,
      deposit_abi: paxDepositABI,
    },

    // ren: {
    //     name: "ren",
    //     full_name: "ren",
    //     symbol: "ren",
    //     reference_asset: 'BTC',
    //     swap_address: '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
    //     token_address: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
    //     gauge_address: '0xB1F2cdeC61db658F091671F5f199635aEF202CAC',
    //     is_plain: true,
    //     underlying_coins: ['renBTC', 'WBTC'],
    //     wrapped_coins: ['renBTC', 'WBTC'],
    //     underlying_coin_addresses: [
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //     ],
    //     underlying_decimals: [8, 8],
    //     wrapped_decimals: [8, 8],
    //     swap_abi: renSwapABI,
    //     gauge_abi: gaugeABI,
    // },

    // sbtc: {
    //     name: "sbtc",
    //     full_name: "sbtc",
    //     symbol: "sbtc",
    //     reference_asset: 'BTC',
    //     swap_address: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
    //     token_address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    //     gauge_address: '0x705350c4BcD35c9441419DdD5d2f097d7a55410F',
    //     sCurveRewards_address: '0x13C1542A468319688B89E323fe9A3Be3A90EBb27',
    //     is_plain: true,
    //     underlying_coins: ['renBTC', 'WBTC', 'sBTC'],
    //     wrapped_coins: ['renBTC', 'WBTC', 'sBTC'],
    //     underlying_coin_addresses: [
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     underlying_decimals: [8, 8, 18],
    //     wrapped_decimals: [8, 8, 18],
    //     swap_abi: sbtcSwapABI,
    //     gauge_abi: gaugeSynthetixABI,
    //     sCurveRewards_abi: sbtcSCurveRewardsABI,
    // },

    // hbtc: {
    //     name: "hbtc",
    //     full_name: "hbtc",
    //     symbol: "hbtc",
    //     reference_asset: 'BTC',
    //     swap_address: '0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F',
    //     token_address: '0xb19059ebb43466C323583928285a49f558E572Fd',
    //     gauge_address: '0x4c18E409Dc8619bFb6a1cB56D114C3f592E0aE79',
    //     is_plain: true,
    //     underlying_coins: ['HBTC', 'WBTC'],
    //     wrapped_coins: ['HBTC', 'WBTC'],
    //     underlying_coin_addresses: [
    //         '0x0316EB71485b0Ab14103307bf65a021042c6d380',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x0316EB71485b0Ab14103307bf65a021042c6d380',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //     ],
    //     underlying_decimals: [18, 8],
    //     wrapped_decimals: [18, 8],
    //     swap_abi: hbtcSwapABI,
    //     gauge_abi: gaugeABI,
    // },

    '3pool': {
      name: '3pool',
      full_name: '3pool',
      symbol: '3pool',
      reference_asset: 'USD',
      swap_address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
      token_address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      gauge_address: '0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A',
      is_plain: true,
      underlying_coins: ['DAI', 'USDC', 'USDT'],
      wrapped_coins: ['DAI', 'USDC', 'USDT'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      underlying_decimals: [18, 6, 6],
      wrapped_decimals: [18, 6, 6],
      swap_abi: tripoolSwapABI,
      gauge_abi: gaugeABI,
    },

    // gusd: {
    //     name: "gusd",
    //     full_name: "gusd",
    //     symbol: "gusd",
    //     reference_asset: 'USD',
    //     swap_address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
    //     token_address: '0xD2967f45c4f384DEEa880F807Be904762a3DeA07',
    //     gauge_address: '0xC5cfaDA84E902aD92DD40194f0883ad49639b023',
    //     deposit_address: '0x64448B78561690B70E17CBE8029a3e5c1bB7136e',
    //     is_meta: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['GUSD', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['GUSD', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [2, 18, 6, 6],
    //     wrapped_decimals: [2, 18],
    //     swap_abi: gusdSwapABI,
    //     gauge_abi: gaugeABI,
    //     deposit_abi: gusdDepositABI,
    // },

    // husd: {
    //     name: "husd",
    //     full_name: "husd",
    //     symbol: "husd",
    //     reference_asset: 'USD',
    //     swap_address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
    //     token_address: '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858',
    //     gauge_address: '0x2db0E83599a91b508Ac268a6197b8B14F5e72840',
    //     deposit_address: '0x09672362833d8f703D5395ef3252D4Bfa51c15ca',
    //     is_meta: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['HUSD', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['HUSD', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0xdF574c24545E5FfEcb9a659c229253D4111d87e1',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xdF574c24545E5FfEcb9a659c229253D4111d87e1',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [8, 18, 6, 6],
    //     wrapped_decimals: [8, 18],
    //     swap_abi: husdSwapABI,
    //     gauge_abi: gaugeABI,
    //     deposit_abi: husdDepositABI,
    // },

    // usdk: {
    //     name: "usdk",
    //     full_name: "usdk",
    //     symbol: "usdk",
    //     reference_asset: 'USD',
    //     swap_address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
    //     token_address: '0x97E2768e8E73511cA874545DC5Ff8067eB19B787',
    //     gauge_address: '0xC2b1DF84112619D190193E48148000e3990Bf627',
    //     deposit_address: '0xF1f85a74AD6c64315F85af52d3d46bF715236ADc',
    //     is_meta: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['USDK', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['USDK', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0x1c48f86ae57291F7686349F12601910BD8D470bb',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x1c48f86ae57291F7686349F12601910BD8D470bb',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [18, 18, 6, 6],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: usdkSwapABI,
    //     gauge_abi: gaugeABI,
    //     deposit_abi: usdkDepositABI,
    // },

    usdn: {
      name: 'usdn',
      full_name: 'usdn',
      symbol: 'usdn',
      reference_asset: 'USD',
      swap_address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
      token_address: '0x4f3E8F405CF5aFC05D68142F3783bDfE13811522',
      gauge_address: '0xF98450B5602fa59CC66e1379DFfB6FDDc724CfC4',
      deposit_address: '0x094d12e5b541784701FD8d65F11fc0598FBC6332',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['USDN', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['USDN', '3Crv'],
      underlying_coin_addresses: [
        '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: usdnSwapABI,
      gauge_abi: gaugeABI,
      deposit_abi: usdnDepositABI,
    },

    // musd: {
    //     name: "musd",
    //     full_name: "musd",
    //     symbol: "musd",
    //     reference_asset: 'USD',
    //     swap_address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
    //     token_address: '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
    //     gauge_address: '0x5f626c30EC1215f4EdCc9982265E8b1F411D1352',
    //     deposit_address: '0x803A2B40c5a9BB2B86DD630B274Fa2A9202874C2',
    //     sCurveRewards_address: "0xE6E6E25EfdA5F69687aA9914f8d750C523A1D261",
    //     is_meta: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['mUSD', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['mUSD', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [18, 18, 6, 6],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: musdSwapABI,
    //     gauge_abi: gaugeSynthetixABI,
    //     deposit_abi: musdDepositABI,
    //     sCurveRewards_abi: musdSCurveRewards_abi,
    // },

    rsv: {
      name: 'rsv',
      full_name: 'rsv',
      symbol: 'rsv',
      reference_asset: 'USD',
      swap_address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
      token_address: '0xC2Ee6b0334C261ED60C72f6054450b61B8f18E35',
      gauge_address: '0x4dC4A289a8E33600D8bD4cf5F6313E43a37adec7',
      deposit_address: '0xBE175115BF33E12348ff77CcfEE4726866A0Fbd5',
      sCurveRewards_address: '0xAD4768F408dD170e62E074188D81A29AE31B8Fd8',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['RSV', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['RSV', '3Crv'],
      underlying_coin_addresses: [
        '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: rsvSwapABI,
      gauge_abi: gaugeSynthetixABI,
      deposit_abi: rsvDepositABI,
      sCurveRewards_abi: rsvSCurveRewards_abi,
    },

    // tbtc: {
    //     name: "tbtc",
    //     full_name: "tbtc",
    //     symbol: "tbtc",
    //     reference_asset: 'BTC',
    //     swap_address: '0xC25099792E9349C7DD09759744ea681C7de2cb66',
    //     token_address: '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
    //     gauge_address: '0x6828bcF74279eE32f2723eC536c22c51Eed383C6',
    //     deposit_address: '0xaa82ca713D94bBA7A89CEAB55314F9EfFEdDc78c',
    //     sCurveRewards_address: '0xAF379f0228ad0d46bB7B4f38f9dc9bCC1ad0360c',
    //     is_meta: true,
    //     base_pool: 'sbtc',
    //     underlying_coins: ['TBTC', 'renBTC', 'WBTC', 'sBTC'],
    //     wrapped_coins: ['TBTC', 'sbtcCrv'],
    //     underlying_coin_addresses: [
    //         '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
    //         '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    //     ],
    //     underlying_decimals: [18, 8, 8, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: tbtcSwapABI,
    //     gauge_abi: gaugeSynthetixABI,
    //     deposit_abi: tbtcDepositABI,
    //     sCurveRewards_abi: tbtcSCurveRewards_abi,
    // },

    dusd: {
      name: 'dusd',
      full_name: 'dusd',
      symbol: 'dusd',
      reference_asset: 'USD',
      swap_address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
      token_address: '0x3a664Ab939FD8482048609f652f9a0B0677337B9',
      gauge_address: '0xAEA6c312f4b3E04D752946d329693F7293bC2e6D',
      deposit_address: '0x61E10659fe3aa93d036d099405224E4Ac24996d0',
      sCurveRewards_address: '0xd9Acb0BAeeD77C99305017821167674Cc7e82f7a',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['DUSD', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['DUSD', '3Crv'],
      underlying_coin_addresses: [
        '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: dusdSwapABI,
      gauge_abi: gaugeSynthetixABI,
      deposit_abi: dusdDepositABI,
      sCurveRewards_abi: dusdSCurveRewards_abi,
    },

    // pbtc: {
    //     name: "pbtc",
    //     full_name: "pbtc",
    //     symbol: "pbtc",
    //     reference_asset: 'BTC',
    //     swap_address: '0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF',
    //     token_address: '0xDE5331AC4B3630f94853Ff322B66407e0D6331E8',
    //     gauge_address: '0xd7d147c6Bb90A718c3De8C0568F9B560C79fa416',
    //     deposit_address: '0x11F419AdAbbFF8d595E7d5b223eee3863Bb3902C',
    //     sCurveRewards_address: "0xf7977edc1fa61aa9b5f90d70a74a3fbc46e9dad3",
    //     is_meta: true,
    //     base_pool: 'sbtc',
    //     underlying_coins: ['pBTC', 'renBTC', 'WBTC', 'sBTC'],
    //     wrapped_coins: ['pBTC', 'sbtcCrv'],
    //     underlying_coin_addresses: [
    //         '0x5228a22e72ccC52d415EcFd199F99D0665E7733b',
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x5228a22e72ccC52d415EcFd199F99D0665E7733b',
    //         '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    //     ],
    //     underlying_decimals: [18, 8, 8, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: pbtcSwapABI,
    //     gauge_abi: gaugeV2ABI,
    //     deposit_abi: pbtcDepositABI,
    //     sCurveRewards_abi: pbtcSCurveRewards_abi,
    // },

    // bbtc: {
    //     name: "bbtc",
    //     full_name: "bbtc",
    //     symbol: "bbtc",
    //     reference_asset: 'BTC',
    //     swap_address: '0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b',
    //     token_address: '0x410e3E86ef427e30B9235497143881f717d93c2A',
    //     gauge_address: '0xdFc7AdFa664b08767b735dE28f9E84cd30492aeE',
    //     deposit_address: '0xC45b2EEe6e09cA176Ca3bB5f7eEe7C47bF93c756',
    //     is_meta: true,
    //     base_pool: 'sbtc',
    //     underlying_coins: ['BBTC', 'renBTC', 'WBTC', 'sBTC'],
    //     wrapped_coins: ['BBTC', 'sbtcCrv'],
    //     underlying_coin_addresses: [
    //         '0x9be89d2a4cd102d8fecc6bf9da793be995c22541',
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x9be89d2a4cd102d8fecc6bf9da793be995c22541',
    //         '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    //     ],
    //     underlying_decimals: [8, 8, 8, 18],
    //     wrapped_decimals: [8, 18],
    //     swap_abi: bbtcSwapABI,
    //     gauge_abi: gaugeV2ABI,
    //     deposit_abi: bbtcDepositABI,
    // },

    // obtc: {
    //     name: "obtc",
    //     full_name: "obtc",
    //     symbol: "obtc",
    //     reference_asset: 'BTC',
    //     swap_address: '0xd81dA8D904b52208541Bade1bD6595D8a251F8dd',
    //     token_address: '0x2fE94ea3d5d4a175184081439753DE15AeF9d614',
    //     gauge_address: '0x11137B10C210b579405c21A07489e28F3c040AB1',
    //     deposit_address: '0xd5BCf53e2C81e1991570f33Fa881c49EEa570C8D',
    //     sCurveRewards_address: "0x7f1ae7a1fc275b5b9c3ad4497fa94e3b9424e76e",
    //     is_meta: true,
    //     base_pool: 'sbtc',
    //     underlying_coins: ['oBTC', 'renBTC', 'WBTC', 'sBTC'],
    //     wrapped_coins: ['oBTC', 'sbtcCrv'],
    //     underlying_coin_addresses: [
    //         '0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68',
    //         '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68',
    //         '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    //     ],
    //     underlying_decimals: [18, 8, 8, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: obtcSwapABI,
    //     gauge_abi: gaugeV2ABI,
    //     deposit_abi: obtcDepositABI,
    //     sCurveRewards_abi: obtcSCurveRewards_abi,
    // },

    seth: {
      name: 'seth',
      full_name: 'seth',
      symbol: 'seth',
      reference_asset: 'ETH',
      swap_address: '0xc5424b857f758e906013f3555dad202e4bdb4567',
      token_address: '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c',
      gauge_address: '0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238',
      is_plain: true,
      underlying_coins: ['ETH', 'sETH'],
      wrapped_coins: ['ETH', 'sETH'],
      underlying_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
      ],
      wrapped_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
      ],
      underlying_decimals: [18, 18],
      wrapped_decimals: [18, 18],
      swap_abi: sethSwapABI,
      gauge_abi: gaugeV2ABI,
    },

    // eurs: {
    //     name: "eurs",
    //     full_name: "eurs",
    //     symbol: "eurs",
    //     reference_asset: 'EUR',
    //     swap_address: '0x0Ce6a5fF5217e38315f87032CF90686C96627CAA',
    //     token_address: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
    //     gauge_address: '0x90Bb609649E0451E5aD952683D64BD2d1f245840',
    //     sCurveRewards_address: "0xc0d8994cd78ee1980885df1a0c5470fc977b5cfe",
    //     is_plain: true,
    //     underlying_coins: ['EURS', 'sEUR'],
    //     wrapped_coins: ['EURS', 'sEUR'],
    //     underlying_coin_addresses: [
    //         '0xdB25f211AB05b1c97D595516F45794528a807ad8',
    //         '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xdB25f211AB05b1c97D595516F45794528a807ad8',
    //         '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
    //     ],
    //     underlying_decimals: [2, 18],
    //     wrapped_decimals: [2, 18],
    //     swap_abi: eursSwapABI,
    //     gauge_abi: gaugeV2ABI,
    //     sCurveRewards_abi: eursSCurveRewards_abi,
    // },

    ust: {
      name: 'ust',
      full_name: 'ust',
      symbol: 'ust',
      reference_asset: 'USD',
      swap_address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
      token_address: '0x94e131324b6054c0D789b190b2dAC504e4361b53',
      gauge_address: '0x3B7020743Bc2A4ca9EaF9D0722d42E20d6935855',
      deposit_address: '0xB0a0716841F2Fc03fbA72A891B8Bb13584F52F2d',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['UST', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['UST', '3Crv'],
      underlying_coin_addresses: [
        '0xa47c8bf37f92abed4a126bda807a7b7498661acd',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0xa47c8bf37f92abed4a126bda807a7b7498661acd',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: ustSwapABI,
      gauge_abi: gaugeV2ABI,
      deposit_abi: ustDepositABI,
    },

    // aave: {
    //     name: "aave",
    //     full_name: "aave",
    //     symbol: "aave",
    //     reference_asset: 'USD',
    //     swap_address: '0xDeBF20617708857ebe4F679508E7b7863a8A8EeE',
    //     token_address: '0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900',
    //     gauge_address: '0xd662908ADA2Ea1916B3318327A97eB18aD588b5d',
    //     sCurveRewards_address: "0x96d7bc17912e4f320c4894194564cf8425cfe8d9",
    //     is_lending: true,
    //     underlying_coins: ['DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['aDAI', 'aUSDC', 'aUSDT'],
    //     underlying_coin_addresses: [
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
    //         '0xBcca60bB61934080951369a648Fb03DF4F96263C',
    //         '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
    //     ],
    //     underlying_decimals: [18, 6, 6],
    //     wrapped_decimals: [18, 6, 6],
    //     use_lending: [true, true, true],
    //     swap_abi: aaveSwapABI,
    //     gauge_abi: gaugeV2ABI,
    //     sCurveRewards_abi: aaveRewardsABI,
    // },

    steth: {
      name: 'steth',
      full_name: 'steth',
      symbol: 'steth',
      reference_asset: 'ETH',
      swap_address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
      token_address: '0x06325440D014e39736583c165C2963BA99fAf14E',
      gauge_address: '0x182B723a58739a9c974cFDB385ceaDb237453c28',
      sCurveRewards_address: '0x99ac10631F69C753DDb595D074422a0922D9056B',
      is_plain: true,
      underlying_coins: ['ETH', 'stETH'],
      wrapped_coins: ['ETH', 'stETH'],
      underlying_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      ],
      wrapped_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      ],
      underlying_decimals: [18, 18],
      wrapped_decimals: [18, 18],
      swap_abi: stethSwapABI,
      gauge_abi: gaugeV2ABI,
      sCurveRewards_abi: stethSCurveRewards_abi,
    },

    // saave: {
    //     name: "saave",
    //     full_name: "saave",
    //     symbol: "saave",
    //     reference_asset: 'USD',
    //     swap_address: '0xEB16Ae0052ed37f479f7fe63849198Df1765a733',
    //     token_address: '0x02d341CcB60fAaf662bC0554d13778015d1b285C',
    //     gauge_address: '0x462253b8F74B72304c145DB0e4Eebd326B22ca39',
    //     sCurveRewards_address: "0xe5f41acad47849c6eb28b93913ca81893fb5a2a6",
    //     is_lending: true,
    //     underlying_coins: ['DAI', 'sUSD'],
    //     wrapped_coins: ['aDAI', 'aSUSD'],
    //     underlying_coin_addresses: [
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
    //         '0x6c5024cd4f8a59110119c56f8933403a539555eb',
    //     ],
    //     underlying_decimals: [18, 18],
    //     wrapped_decimals: [18, 18],
    //     use_lending: [true, true],
    //     swap_abi: saaveSwapABI,
    //     gauge_abi: gaugeV2ABI,
    //     sCurveRewards_abi: aaveRewardsABI,
    // },

    ankreth: {
      name: 'ankreth',
      full_name: 'ankreth',
      symbol: 'ankreth',
      reference_asset: 'ETH',
      swap_address: '0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2',
      token_address: '0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf',
      gauge_address: '0x6d10ed2cf043e6fcf51a0e7b4c2af3fa06695707',
      sCurveRewards_address: '0x3547DFCa04358540891149559e691B146c6B0043',
      is_plain: true,
      underlying_coins: ['ETH', 'ankrETH'],
      wrapped_coins: ['ETH', 'ankrETH'],
      underlying_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
      ],
      wrapped_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
      ],
      underlying_decimals: [18, 18],
      wrapped_decimals: [18, 18],
      swap_abi: ankrethSwapABI,
      gauge_abi: gaugeV2ABI,
      sCurveRewards_abi: ankrethSCurveRewards_abi,
    },

    usdp: {
      name: 'usdp',
      full_name: 'usdp',
      symbol: 'usdp',
      reference_asset: 'USD',
      swap_address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
      token_address: '0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6',
      gauge_address: '0x055be5DDB7A925BfEF3417FC157f53CA77cA7222',
      deposit_address: '0x3c8cAee4E09296800f8D29A68Fa3837e2dae4940',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['USDP', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['USDP', '3Crv'],
      underlying_coin_addresses: [
        '0x1456688345527bE1f37E9e627DA0837D6f08C925',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x1456688345527bE1f37E9e627DA0837D6f08C925',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: usdpSwapABI,
      gauge_abi: gaugeV2ABI,
      deposit_abi: usdpDepositABI,
    },

    ib: {
      name: 'ironbank',
      full_name: 'ironbank',
      symbol: 'ib',
      reference_asset: 'USD',
      swap_address: '0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF',
      token_address: '0x5282a4eF67D9C33135340fB3289cc1711c13638C',
      gauge_address: '0xF5194c3325202F456c95c1Cf0cA36f8475C1949F',
      is_lending: true,
      underlying_coins: ['DAI', 'USDC', 'USDT'],
      wrapped_coins: ['cyDAI', 'cyUSDC', 'cyUSDT'],
      underlying_coin_addresses: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x8e595470ed749b85c6f7669de83eae304c2ec68f',
        '0x76eb2fe28b36b3ee97f3adae0c69606eedb2a37c',
        '0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a',
      ],
      underlying_decimals: [18, 6, 6],
      wrapped_decimals: [8, 8, 8],
      use_lending: [true, true, true],
      swap_abi: ibSwapABI,
      gauge_abi: gaugeV2ABI,
    },

    // link: {
    //     name: "link",
    //     full_name: "link",
    //     symbol: "link",
    //     reference_asset: 'LINK',
    //     swap_address: '0xF178C0b5Bb7e7aBF4e12A4838C7b7c5bA2C623c0',
    //     token_address: '0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a',
    //     gauge_address: '0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d',
    //     is_plain: true,
    //     underlying_coins: ['LINK', 'sLINK'],
    //     wrapped_coins: ['LINK', 'sLINK'],
    //     underlying_coin_addresses: [
    //         '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    //         '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    //         '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
    //     ],
    //     underlying_decimals: [18, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: linkSwapABI,
    //     gauge_abi: gaugeV2ABI,
    // },
    tusd: {
      name: 'tusd',
      full_name: 'tusd',
      symbol: 'tusd',
      reference_asset: 'USD',
      swap_address: '0xecd5e75afb02efa118af914515d6521aabd189f1',
      token_address: '0xecd5e75afb02efa118af914515d6521aabd189f1',
      gauge_address: '0x359FD5d6417aE3D8D6497d9B2e7A890798262BA4',
      deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['TUSD', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['TUSD', '3Crv'],
      underlying_coin_addresses: [
        '0x0000000000085d4780B73119b644AE5ecd22b376',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x0000000000085d4780B73119b644AE5ecd22b376',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: factorySwapABI,
      gauge_abi: gaugeV2ABI,
      deposit_abi: factoryDepositABI,
    },
    frax: {
      name: 'frax',
      full_name: 'frax',
      symbol: 'frax',
      reference_asset: 'USD',
      swap_address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
      token_address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
      gauge_address: '0x72e158d38dbd50a483501c24f792bdaaa3e7d55c',
      deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
      sCurveRewards_address: '0xBBbAf1adf4d39B2843928CCa1E65564e5ce99ccC',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['FRAX', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['FRAX', '3Crv'],
      underlying_coin_addresses: [
        '0x853d955acef822db058eb8505911ed77f175b99e',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x853d955acef822db058eb8505911ed77f175b99e',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: factorySwapABI,
      deposit_abi: factoryDepositABI,
      gauge_abi: gaugeV2ABI,
      sCurveRewards_abi: factoryRewardsABI,
    },
    lusd: {
      name: 'lusd',
      full_name: 'lusd',
      symbol: 'lusd',
      reference_asset: 'USD',
      swap_address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
      token_address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
      gauge_address: '0x9b8519a9a00100720ccdc8a120fbed319ca47a14',
      deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
      sCurveRewards_address: '0xeb31da939878d1d780fdbcc244531c0fb80a2cf3',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['LUSD', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['LUSD', '3Crv'],
      underlying_coin_addresses: [
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: factorySwapABI,
      gauge_abi: gaugeV2ABI,
      deposit_abi: factoryDepositABI,
      sCurveRewards_abi: factoryRewardsABI,
    },
    busdv2: {
      name: 'busdv2',
      full_name: 'busdv2',
      symbol: 'busdv2',
      reference_asset: 'USD',
      swap_address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
      token_address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
      gauge_address: '0xd4b22fedca85e684919955061fdf353b9d38389b',
      deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['BUSD', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['BUSD', '3Crv'],
      underlying_coin_addresses: [
        '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: factorySwapABI,
      gauge_abi: gaugeV2ABI,
      deposit_abi: factoryDepositABI,
    },
    reth: {
      name: 'reth',
      full_name: 'reth',
      symbol: 'reth',
      reference_asset: 'ETH',
      swap_address: '0xF9440930043eb3997fc70e1339dBb11F341de7A8',
      token_address: '0x53a901d48795C58f485cBB38df08FA96a24669D5',
      gauge_address: '0x824F13f1a2F29cFEEa81154b46C0fc820677A637',
      sCurveRewards_address: '0x3b7382805A1d887b73e98570796C5cEFeA32A462',
      is_plain: true,
      underlying_coins: ['ETH', 'rETH'],
      wrapped_coins: ['ETH', 'rETH'],
      underlying_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593',
      ],
      wrapped_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593',
      ],
      underlying_decimals: [18, 18],
      wrapped_decimals: [18, 18],
      swap_abi: rethSwapABI,
      gauge_abi: gaugeV3ABI,
      sCurveRewards_abi: factoryRewardsABI,
    },
    alusd: {
      name: 'alusd',
      full_name: 'alusd',
      symbol: 'alusd',
      reference_asset: 'USD',
      swap_address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
      token_address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
      gauge_address: '0x9582C4ADACB3BCE56Fea3e590F05c3ca2fb9C477',
      deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
      sCurveRewards_address: '0xb76256d1091e93976c61449d6e500d9f46d827d4',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['alUSD', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['alUSD', '3Crv'],
      underlying_coin_addresses: [
        '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: factorySwapABI,
      gauge_abi: gaugeV3ABI,
      deposit_abi: factoryDepositABI,
      sCurveRewards_abi: factoryRewardsABI,
    },
    mim: {
      name: 'mim',
      full_name: 'mim',
      symbol: 'mim',
      reference_asset: 'USD',
      swap_address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
      token_address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
      gauge_address: '0xd8b712d29381748dB89c36BCa0138d7c75866ddF',
      deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['MIM', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['MIM', '3Crv'],
      underlying_coin_addresses: [
        '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: factorySwapABI,
      gauge_abi: gaugeFactoryABI,
      deposit_abi: factoryDepositABI,
      sCurveRewards_abi: factoryRewardsABI,
    },
    tricrypto2: {
      name: 'tricrypto2',
      full_name: 'tricrypto2',
      symbol: 'tricrypto2',
      reference_asset: 'CRYPTO',
      swap_address: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
      token_address: '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff',
      gauge_address: '0xDeFd8FdD20e0f34115C7018CCfb655796F6B2168',
      deposit_address: '0x3993d34e7e99Abf6B6f367309975d1360222D446',
      is_crypto: true,
      underlying_coins: ['USDT', 'WBTC', 'ETH'],
      wrapped_coins: ['USDT', 'WBTC', 'WETH'],
      underlying_coin_addresses: [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      ],
      wrapped_coin_addresses: [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      ],
      underlying_decimals: [6, 8, 18],
      wrapped_decimals: [6, 8, 18],
      swap_abi: tricrypto2SwapABI,
      gauge_abi: gaugeV3ABI,
      deposit_abi: tricrypto2DepositABI,
    },
    // eurt: {
    //     name: "eurt",
    //     full_name: "eurt",
    //     symbol: "eurt",
    //     reference_asset: 'EUR',
    //     swap_address: '0xfd5db7463a3ab53fd211b4af195c5bccc1a03890',
    //     token_address: '0xfd5db7463a3ab53fd211b4af195c5bccc1a03890',
    //     gauge_address: '0xe8060Ad8971450E624d5289A10017dD30F5dA85F',
    //     is_plain: true,
    //     underlying_coins: ['EURT', 'sEUR'],
    //     wrapped_coins: ['EURT', 'sEUR'],
    //     underlying_coin_addresses: [
    //         '0xC581b735A1688071A1746c968e0798D642EDE491',
    //         '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xC581b735A1688071A1746c968e0798D642EDE491',
    //         '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
    //     ],
    //     underlying_decimals: [6, 18],
    //     wrapped_decimals: [6, 18],
    //     swap_abi: eurtSwapABI,
    //     gauge_abi: gaugeV3ABI,
    // },
    // eurtusd: {
    //     name: "eurtusd",
    //     full_name: "eurtusd",
    //     symbol: "eurtusd",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0x9838eCcC42659FA8AA7daF2aD134b53984c9427b',
    //     token_address: '0x3b6831c0077a1e44ED0a21841C3bC4dC11bCE833',
    //     gauge_address: '0x4Fd86Ce7Ecea88F7E0aA78DC12625996Fb3a04bC',
    //     deposit_address: '0x5D0F47B32fDd343BfA74cE221808e2abE4A53827',
    //     is_meta: true,
    //     is_crypto: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['EURT', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['EURT', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0xC581b735A1688071A1746c968e0798D642EDE491',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xC581b735A1688071A1746c968e0798D642EDE491',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [6, 18, 6, 6],
    //     wrapped_decimals: [6, 18],
    //     swap_abi: eurtusdSwapABI,
    //     gauge_abi: gaugeV4ABI,
    //     deposit_abi: eurtusdDepositABI,
    // },
    // eursusd: {
    //     name: "eursusd",
    //     full_name: "eursusd",
    //     symbol: "eursusd",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B',
    //     token_address: '0x3D229E1B4faab62F621eF2F6A610961f7BD7b23B',
    //     gauge_address: '0x65CA7Dc5CB661fC58De57B1E1aF404649a27AD35',
    //     is_crypto: true,
    //     is_plain: true,
    //     underlying_coins: ['USDC', 'EURS'],
    //     wrapped_coins: ['USDC', 'EURS'],
    //     underlying_coin_addresses: [
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdB25f211AB05b1c97D595516F45794528a807ad8',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdB25f211AB05b1c97D595516F45794528a807ad8',
    //     ],
    //     underlying_decimals: [6, 2],
    //     wrapped_decimals: [6, 2],
    //     swap_abi: eursusdSwapABI,
    //     gauge_abi: gaugeV4ABI,
    // },
    // crveth: {
    //     name: "crveth",
    //     full_name: "crveth",
    //     symbol: "crveth",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
    //     token_address: '0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d',
    //     gauge_address: '0x1cEBdB0856dd985fAe9b8fEa2262469360B8a3a6',
    //     is_crypto: true,
    //     underlying_coins: ['ETH', 'CRV'],
    //     wrapped_coins: ['WETH', 'CRV'],
    //     underlying_coin_addresses: [
    //         '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //         '0xD533a949740bb3306d119CC777fa900bA034cd52',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //         '0xD533a949740bb3306d119CC777fa900bA034cd52',
    //     ],
    //     underlying_decimals: [18, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: crvethSwapABI,
    //     gauge_abi: gaugeV4ABI,
    // },
    rai: {
      name: 'rai',
      full_name: 'rai',
      symbol: 'rai',
      reference_asset: 'USD',
      swap_address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
      token_address: '0x6BA5b4e438FA0aAf7C1bD179285aF65d13bD3D90',
      gauge_address: '0x66ec719045bBD62db5eBB11184c18237D3Cc2E62',
      deposit_address: '0xcB636B81743Bb8a7F1E355DEBb7D33b07009cCCC',
      is_meta: true,
      base_pool: '3pool',
      underlying_coins: ['RAI', 'DAI', 'USDC', 'USDT'],
      wrapped_coins: ['RAI', '3Crv'],
      underlying_coin_addresses: [
        '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      ],
      underlying_decimals: [18, 18, 6, 6],
      wrapped_decimals: [18, 18],
      swap_abi: raiSwapABI,
      gauge_abi: gaugeV4ABI,
      deposit_abi: raiDepositABI,
    },
    // cvxeth: {
    //     name: "cvxeth",
    //     full_name: "cvxeth",
    //     symbol: "cvxeth",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4',
    //     token_address: '0x3A283D9c08E8b55966afb64C515f5143cf907611',
    //     gauge_address: '0x7E1444BA99dcdFfE8fBdb42C02F0005D14f13BE1',
    //     is_crypto: true,
    //     underlying_coins: ['ETH', 'CVX'],
    //     wrapped_coins: ['WETH', 'CVX'],
    //     underlying_coin_addresses: [
    //         '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //         '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //         '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    //     ],
    //     underlying_decimals: [18, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: crvethSwapABI,
    //     gauge_abi: gaugeV4ABI,
    // },
    // xautusd: {
    //     name: "xautusd",
    //     full_name: "xautusd",
    //     symbol: "xautusd",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0xAdCFcf9894335dC340f6Cd182aFA45999F45Fc44',
    //     token_address: '0x8484673cA7BfF40F82B041916881aeA15ee84834',
    //     gauge_address: '0x1B3E14157ED33F60668f2103bCd5Db39a1573E5B',
    //     deposit_address: '0xc5FA220347375ac4f91f9E4A4AAb362F22801504',
    //     is_meta: true,
    //     is_crypto: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['XAUt', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['XAUt', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0x68749665ff8d2d112fa859aa293f07a622782f38',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x68749665ff8d2d112fa859aa293f07a622782f38',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [6, 18, 6, 6],
    //     wrapped_decimals: [6, 18],
    //     swap_abi: eurtusdSwapABI,
    //     gauge_abi: gaugeV4ABI,
    //     deposit_abi: eurtusdDepositABI,
    // },
    // spelleth: {
    //     name: "spelleth",
    //     full_name: "spelleth",
    //     symbol: "spelleth",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0x98638FAcf9a3865cd033F36548713183f6996122',
    //     token_address: '0x8282BD15dcA2EA2bDf24163E8f2781B30C43A2ef',
    //     gauge_address: '0x08380a4999Be1a958E2abbA07968d703C7A3027C',
    //     is_crypto: true,
    //     underlying_coins: ['ETH', 'SPELL'],
    //     wrapped_coins: ['WETH', 'SPELL'],
    //     underlying_coin_addresses: [
    //         '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //         '0x090185f2135308bad17527004364ebcc2d37e5f6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //         '0x090185f2135308bad17527004364ebcc2d37e5f6',
    //     ],
    //     underlying_decimals: [18, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: crvethSwapABI,
    //     gauge_abi: gaugeV4ABI,
    // },
    // teth: {
    //     name: "teth",
    //     full_name: "teth",
    //     symbol: "teth",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0x752eBeb79963cf0732E9c0fec72a49FD1DEfAEAC',
    //     token_address: '0xCb08717451aaE9EF950a2524E33B6DCaBA60147B',
    //     gauge_address: '0x6070fBD4E608ee5391189E7205d70cc4A274c017',
    //     is_crypto: true,
    //     underlying_coins: ['ETH', 'T'],
    //     wrapped_coins: ['WETH', 'T'],
    //     underlying_coin_addresses: [
    //         '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //         '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //         '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',
    //     ],
    //     underlying_decimals: [18, 18],
    //     wrapped_decimals: [18, 18],
    //     swap_abi: crvethSwapABI,
    //     gauge_abi: gaugeV4ABI,
    // },
    '2pool': {
      name: '2pool',
      full_name: '2pool',
      symbol: '2pool',
      reference_asset: 'USD',
      swap_address: '0x1005f7406f32a61bd760cfa14accd2737913d546',
      token_address: '0x1005f7406f32a61bd760cfa14accd2737913d546',
      gauge_address: '0x9f330db38caaae5b61b410e2f0aad63fff2109d8',
      is_plain: true,
      underlying_coins: ['USDC', 'USDT'],
      wrapped_coins: ['USDC', 'USDT'],
      underlying_coin_addresses: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      wrapped_coin_addresses: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      underlying_decimals: [6, 6],
      wrapped_decimals: [6, 6],
      swap_abi: twopoolSwapABI,
      gauge_abi: gaugeV5ABI,
    },
    '4pool': {
      name: '4pool',
      full_name: '4pool',
      symbol: '4pool',
      reference_asset: 'USD',
      swap_address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
      token_address: '0x4e0915C88bC70750D68C481540F081fEFaF22273',
      gauge_address: '0x34883134a39b206a451c2d3b0e7cac44be4d9181',
      is_plain: true,
      underlying_coins: ['USDC', 'USDT', 'UST', 'FRAX'],
      wrapped_coins: ['USDC', 'USDT', 'UST', 'FRAX'],
      underlying_coin_addresses: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0xa693B19d2931d498c5B318dF961919BB4aee87a5',
        '0x853d955acef822db058eb8505911ed77f175b99e',
      ],
      wrapped_coin_addresses: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0xa693B19d2931d498c5B318dF961919BB4aee87a5',
        '0x853d955acef822db058eb8505911ed77f175b99e',
      ],
      underlying_decimals: [6, 6, 6, 18],
      wrapped_decimals: [6, 6, 6, 18],
      swap_abi: fourpoolSwapABI,
      gauge_abi: gaugeV5ABI,
    },
    fraxusdc: {
      name: 'fraxusdc',
      full_name: 'fraxusdc',
      symbol: 'fraxusdc',
      reference_asset: 'USD',
      swap_address: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',
      token_address: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
      gauge_address: '0xCFc25170633581Bf896CB6CDeE170e3E3Aa59503',
      is_plain: true,
      underlying_coins: ['FRAX', 'USDC'],
      wrapped_coins: ['FRAX', 'USDC'],
      underlying_coin_addresses: [
        '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ],
      wrapped_coin_addresses: [
        '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ],
      underlying_decimals: [18, 6],
      wrapped_decimals: [18, 6],
      swap_abi: fraxusdcSwapABI,
      gauge_abi: gaugeV5ABI,
    },
    // euroc: {
    //     name: "euroc",
    //     full_name: "euroc",
    //     symbol: "euroc",
    //     reference_asset: 'CRYPTO',
    //     swap_address: '0xE84f5b1582BA325fDf9cE6B0c1F087ccfC924e54',
    //     token_address: '0x70fc957eb90E37Af82ACDbd12675699797745F68',
    //     gauge_address: '0x4329c8F09725c0e3b6884C1daB1771bcE17934F9',
    //     deposit_address: '0xd446A98F88E1d053d1F64986E3Ed083bb1Ab7E5A',
    //     is_meta: true,
    //     is_crypto: true,
    //     base_pool: '3pool',
    //     underlying_coins: ['EUROC', 'DAI', 'USDC', 'USDT'],
    //     wrapped_coins: ['EUROC', '3Crv'],
    //     underlying_coin_addresses: [
    //         '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    //         '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //         '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //         '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    //         '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    //     ],
    //     underlying_decimals: [6, 18, 6, 6],
    //     wrapped_decimals: [6, 18],
    //     swap_abi: eurtusdSwapABI,
    //     gauge_abi: gaugeV5ABI,
    //     deposit_abi: eurtusdDepositABI,
    // },
    frxeth: {
      name: 'frxeth',
      full_name: 'frxeth',
      symbol: 'frxeth',
      reference_asset: 'ETH',
      swap_address: '0xa1F8A6807c402E4A15ef4EBa36528A3FED24E577',
      token_address: '0xf43211935C781D5ca1a41d2041F397B8A7366C7A',
      gauge_address: '0x2932a86df44Fe8D2A706d8e9c5d51c24883423F5',
      is_plain: true,
      underlying_coins: ['ETH', 'frxETH'],
      wrapped_coins: ['ETH', 'frxETH'],
      underlying_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x5E8422345238F34275888049021821E8E08CAa1f',
      ],
      wrapped_coin_addresses: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x5E8422345238F34275888049021821E8E08CAa1f',
      ],
      underlying_decimals: [18, 18],
      wrapped_decimals: [18, 18],
      swap_abi: frxethSwapABI,
      gauge_abi: gaugeV5ABI,
    },
    // sbtc2: {
    //     name: "sbtc2",
    //     full_name: "sbtc2",
    //     symbol: "sbtc2",
    //     reference_asset: 'BTC',
    //     swap_address: "0xf253f83AcA21aAbD2A20553AE0BF7F65C755A07F",
    //     token_address: "0x051d7e5609917Bd9b73f04BAc0DED8Dd46a74301",
    //     gauge_address: "0x6D787113F23bED1D5e1530402B3f364D0A6e5Af3",
    //     is_plain: true,
    //     underlying_coins: ['WBTC', 'sBTC'],
    //     wrapped_coins: ['WBTC', 'sBTC'],
    //     underlying_coin_addresses: [
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     wrapped_coin_addresses: [
    //         '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    //         '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    //     ],
    //     underlying_decimals: [8, 18],
    //     wrapped_decimals: [8, 18],
    //     swap_abi: sbtc2SwapABI,
    //     gauge_abi: gaugeV5ABI,
    // },
    fraxusdp: {
      name: 'fraxusdp',
      full_name: 'fraxusdp',
      symbol: 'fraxusdp',
      reference_asset: 'USD',
      swap_address: '0xaE34574AC03A15cd58A92DC79De7B1A0800F1CE3',
      token_address: '0xFC2838a17D8e8B1D5456E0a351B0708a09211147',
      gauge_address: '0xfb860600F1bE1f1c72A89B2eF5CAF345aff7D39d',
      is_plain: true,
      underlying_coins: ['FRAX', 'USDP'],
      wrapped_coins: ['FRAX', 'USDP'],
      underlying_coin_addresses: [
        '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      ],
      wrapped_coin_addresses: [
        '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      ],
      underlying_decimals: [18, 18],
      wrapped_decimals: [18, 18],
      swap_abi: fraxusdcSwapABI,
      gauge_abi: gaugeV5ABI,
    },
  }
)
