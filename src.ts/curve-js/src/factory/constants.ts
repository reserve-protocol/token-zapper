import { type IDict } from '../interfaces'
import { lowerCaseKeys } from '../constants/utils'
import { JsonFragment } from '@ethersproject/abi'

import factorySwapABI from '../constants/abis/factoryPools/swap.json'
import MetaUSDABI from '../constants/abis/factory-v2/MetaUSD.json'
import MetaUSDBalancesABI from '../constants/abis/factory-v2/MetaUSDBalances.json'
import MetaFraxUSDABI from '../constants/abis/factory-v2/MetaFraxUSD.json'
import MetaFraxUSDBalancesABI from '../constants/abis/factory-v2/MetaFraxUSDBalances.json'
import MetaBTCABI from '../constants/abis/factory-v2/MetaBTC.json'
import MetaBTCBalancesABI from '../constants/abis/factory-v2/MetaBTCBalances.json'
import MetaBTCRenABI from '../constants/abis/factory-v2/MetaBTCRen.json'
import MetaBTCRenBalancesABI from '../constants/abis/factory-v2/MetaBTCBalancesRen.json'
import MetaSbtc2ABI from '../constants/abis/factory-v2/MetaSbtc2.json'
import MetaSbtc2BalancesABI from '../constants/abis/factory-v2/MetaSbtc2Balance.json'
import Plain2BasicABI from '../constants/abis/factory-v2/Plain2Basic.json'
import Plain2BalancesABI from '../constants/abis/factory-v2/Plain2Balances.json'
import Plain2ETHABI from '../constants/abis/factory-v2/Plain2ETH.json'
import Plain2OptimizedABI from '../constants/abis/factory-v2/Plain2Optimized.json'
import Plain3BasicABI from '../constants/abis/factory-v2/Plain3Basic.json'
import Plain3BalancesABI from '../constants/abis/factory-v2/Plain3Balances.json'
import Plain3ETHABI from '../constants/abis/factory-v2/Plain3ETH.json'
import Plain3OptimizedABI from '../constants/abis/factory-v2/Plain3Optimized.json'
import Plain4BasicABI from '../constants/abis/factory-v2/Plain4Basic.json'
import Plain4BalancesABI from '../constants/abis/factory-v2/Plain4Balances.json'
import Plain4ETHABI from '../constants/abis/factory-v2/Plain4ETH.json'
import Plain4OptimizedABI from '../constants/abis/factory-v2/Plain4Optimized.json'
// --- ZAPS --
import factoryDepositABI from '../constants/abis/factoryPools/deposit.json'
import fraxusdcMetaZapABI from '../constants/abis/fraxusdc/meta_zap.json'
import RenMetaZapABI from '../constants/abis/ren/meta_zap.json'
import Sbtc2MetaZapABI from '../constants/abis/sbtc2/meta_zap.json'

export const implementationABIDictEthereum: IDict<
  () => Promise<JsonFragment[]>
> = lowerCaseKeys({
  '0x5F890841f657d90E081bAbdB532A05996Af79Fe6': () =>
    Promise.resolve(factorySwapABI as JsonFragment[]),

  '0x213be373FDff327658139C7df330817DAD2d5bBE': () =>
    Promise.resolve(MetaUSDABI as JsonFragment[]),
  '0x55Aa9BF126bCABF0bDC17Fa9E39Ec9239e1ce7A9': () =>
    Promise.resolve(MetaUSDBalancesABI as JsonFragment[]),

  '0x33bB0e62d5e8C688E645Dd46DFb48Cd613250067': () =>
    Promise.resolve(MetaFraxUSDABI as JsonFragment[]), // fraxusdc
  '0x2EB24483Ef551dA247ab87Cf18e1Cc980073032D': () =>
    Promise.resolve(MetaFraxUSDBalancesABI as JsonFragment[]), // fraxusdc

  '0xF9B62b61d108232Ef0C9DD143bb3c22c7D4A715a': () =>
    Promise.resolve(MetaFraxUSDABI as JsonFragment[]), // fraxusdp
  '0xB172AC2Fe440B5dA74Dc460e5E9d96bc2BF6261F': () =>
    Promise.resolve(MetaFraxUSDBalancesABI as JsonFragment[]), // fraxusdp

  '0xC6A8466d128Fbfd34AdA64a9FFFce325D57C9a52': () =>
    Promise.resolve(MetaBTCABI as JsonFragment[]),
  '0xc4C78b08fA0c3d0a312605634461A88184Ecd630': () =>
    Promise.resolve(MetaBTCBalancesABI as JsonFragment[]),

  '0xECAaecd9d2193900b424774133B1f51ae0F29d9E': () =>
    Promise.resolve(MetaBTCRenABI as JsonFragment[]),
  '0x40fD58D44cFE63E8517c9Bb3ac98676838Ea56A8': () =>
    Promise.resolve(MetaBTCRenBalancesABI as JsonFragment[]),

  '0x008CFa89df5B0c780cA3462fc2602D7F8c7Ac315': () =>
    Promise.resolve(MetaSbtc2ABI as JsonFragment[]),
  '0xAbc533EbCDdeD41215C46ee078C5818B5b0A252F': () =>
    Promise.resolve(MetaSbtc2BalancesABI as JsonFragment[]),

  '0x6523Ac15EC152Cb70a334230F6c5d62C5Bd963f1': () =>
    Promise.resolve(Plain2BasicABI as JsonFragment[]),
  '0x24D937143d3F5cF04c72bA112735151A8CAE2262': () =>
    Promise.resolve(Plain2BalancesABI as JsonFragment[]),
  '0x6326DEbBAa15bCFE603d831e7D75f4fc10d9B43E': () =>
    Promise.resolve(Plain2ETHABI as JsonFragment[]),
  '0x4A4d7868390EF5CaC51cDA262888f34bD3025C3F': () =>
    Promise.resolve(Plain2OptimizedABI as JsonFragment[]),
  '0xc629a01eC23AB04E1050500A3717A2a5c0701497': () =>
    Promise.resolve(Plain2BasicABI as JsonFragment[]), // EMA
  '0x94b4DFd9Ba5865Cc931195c99A2db42F3fc5d45B': () =>
    Promise.resolve(Plain2ETHABI as JsonFragment[]), // EMA

  '0x9B52F13DF69D79Ec5aAB6D1aCe3157d29B409cC3': () =>
    Promise.resolve(Plain3BasicABI as JsonFragment[]),
  '0x50b085f2e5958C4A87baf93A8AB79F6bec068494': () =>
    Promise.resolve(Plain3BalancesABI as JsonFragment[]),
  '0x8c1aB78601c259E1B43F19816923609dC7d7de9B': () =>
    Promise.resolve(Plain3ETHABI as JsonFragment[]),
  '0xE5F4b89E0A16578B3e0e7581327BDb4C712E44De': () =>
    Promise.resolve(Plain3OptimizedABI as JsonFragment[]),

  '0x5Bd47eA4494e0F8DE6e3Ca10F1c05F55b72466B8': () =>
    Promise.resolve(Plain4BasicABI as JsonFragment[]),
  '0xd35B58386705CE75CE6d09842E38E9BE9CDe5bF6': () =>
    Promise.resolve(Plain4BalancesABI as JsonFragment[]),
  '0x88855cdF2b0A8413D470B86952E726684de915be': () =>
    Promise.resolve(Plain4ETHABI as JsonFragment[]),
  '0xaD4753D045D3Aed5C1a6606dFb6a7D7AD67C1Ad7': () =>
    Promise.resolve(Plain4OptimizedABI as JsonFragment[]),
})

export const implementationBasePoolIdDictEthereum: IDict<string> =
  lowerCaseKeys({
    '0x5F890841f657d90E081bAbdB532A05996Af79Fe6': '3pool',

    '0x213be373FDff327658139C7df330817DAD2d5bBE': '3pool',
    '0x55Aa9BF126bCABF0bDC17Fa9E39Ec9239e1ce7A9': '3pool',

    '0x33bB0e62d5e8C688E645Dd46DFb48Cd613250067': 'fraxusdc',
    '0x2EB24483Ef551dA247ab87Cf18e1Cc980073032D': 'fraxusdc',

    '0xF9B62b61d108232Ef0C9DD143bb3c22c7D4A715a': 'fraxusdp',
    '0xB172AC2Fe440B5dA74Dc460e5E9d96bc2BF6261F': 'fraxusdp',

    '0xC6A8466d128Fbfd34AdA64a9FFFce325D57C9a52': 'sbtc',
    '0xc4C78b08fA0c3d0a312605634461A88184Ecd630': 'sbtc',

    '0xECAaecd9d2193900b424774133B1f51ae0F29d9E': 'ren',
    '0x40fD58D44cFE63E8517c9Bb3ac98676838Ea56A8': 'ren',

    '0x008CFa89df5B0c780cA3462fc2602D7F8c7Ac315': 'sbtc2',
    '0xAbc533EbCDdeD41215C46ee078C5818B5b0A252F': 'sbtc2',
  })

export const basePoolIdZapDictEthereum: IDict<{
  address: string
  ABI: () => Promise<JsonFragment[]>
}> = {
  '3pool': {
    address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359'.toLowerCase(),
    ABI: () => Promise.resolve(factoryDepositABI as JsonFragment[]),
  },
  fraxusdc: {
    address: '0x08780fb7E580e492c1935bEe4fA5920b94AA95Da'.toLowerCase(),
    ABI: () => Promise.resolve(fraxusdcMetaZapABI as JsonFragment[]),
  },
  fraxusdp: {
    address: '0x63B709d2118Ba0389ee75A131d1F9a473e06afbD'.toLowerCase(),
    ABI: () => Promise.resolve(fraxusdcMetaZapABI as JsonFragment[]),
  },
  sbtc: {
    address: '0x7abdbaf29929e7f8621b757d2a7c04d78d633834'.toLowerCase(),
    ABI: () => Promise.resolve(factoryDepositABI as JsonFragment[]),
  },
  ren: {
    address: '0x8Fb3Ec8f2d1Dc089E70CD61f1E49496d443B2124'.toLowerCase(),
    ABI: () => Promise.resolve(RenMetaZapABI as JsonFragment[]),
  },
  sbtc2: {
    address: '0xA2d40Edbf76C6C0701BA8899e2d059798eBa628e'.toLowerCase(),
    ABI: () => Promise.resolve(Sbtc2MetaZapABI as JsonFragment[]),
  },
}

export const FACTORY_CONSTANTS: {
  [index: number]: {
    implementationABIDict: IDict<() => Promise<JsonFragment[]>>
    implementationBasePoolIdDict: IDict<string>
    basePoolIdZapDict: IDict<{
      address: string
      ABI: () => Promise<JsonFragment[]>
    }>
  }
} = {
  1: {
    // ETH
    implementationABIDict: implementationABIDictEthereum,
    implementationBasePoolIdDict: implementationBasePoolIdDictEthereum,
    basePoolIdZapDict: basePoolIdZapDictEthereum,
  },
}
