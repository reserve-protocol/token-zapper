import { type Universe } from '../Universe';
import { GAS_TOKEN_ADDRESS } from '../base/constants';
import { makeConfig } from './ChainConfiguration';
export const COMMON_TOKENS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
  DAI: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
  WETH: '0x4200000000000000000000000000000000000006',
  ERC20GAS: '0x4200000000000000000000000000000000000006'
} as const;

export const RTOKENS = {
  hyUSD: {
    main: '0xA582985c68ED30a052Ff0b07D74931140bd5a00F',
    erc20: "0xCc7FF230365bD730eE4B352cC2492CEdAC49383e"
  }
} as const;

export const baseConfig = makeConfig(
  8453,
  {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
  },
  COMMON_TOKENS,
  RTOKENS,
  {
    facadeAddress: "0xe1aa15DA8b993c6312BAeD91E0b470AE405F91BF",
    zapperAddress: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
    executorAddress: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    wrappedNative: "0x4200000000000000000000000000000000000006",
    rtokenLens: "0x323EB0B5e2a59d5565E59CBEb965f00298d3A2a1",

    balanceOf: "0x0000000000000000000000000000000000000000"
  }
)

export const PROTOCOL_CONFIGS = {
  usdPriceOracles: {
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "0x7e860098f58bbfc8648a4311b374b1d669a2bc6b", // USDC/USD
    "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": "0x7e860098f58bbfc8648a4311b374b1d669a2bc6b", // USDC/USD
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": "0x591e79239a7d679378ec8c847e5038150364c78f", // DAI/USD
    // "": "0xf19d560eb8d2adf07bd6d13ed03e1d11215721f9", // USDT/USD
    [GAS_TOKEN_ADDRESS]: "0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70", // ETH/USD
    "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": "0xd7818272b9e248357d13057aab0b417af31e817d", // cbETH/USD
    // "": "0xccadc697c55bbb68dc5bcdf8d3cbe83cdd4e071e", // WBTC / USD

  },
  ethPriceOracles: {
    "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": "0x806b4ac04501c29769051e42783cf04dce41440b", // cbETH / ETH
    // "": "0xf586d0728a47229e747d824a939000cf21def5a0", // stETH / ETH
    // "": "0xf397bf97280b488ca19ee3093e81c0a77f02e9a5", // rETH / ETH
  },
  aave: {
    tokenWrappers: [
      '0x308447562442Cc43978f8274fA722C9C14BafF8b'
    ],
  },
  stargate: {
    router: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B",
    wrappers: [
      "0x073F98792ef4c00bB5f11B1F64f13cB25Cde0d8D"
    ],
    tokens: [
      "0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA"
    ],
  },
  compoundV3: {
    markets: [
      {
        baseToken: "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDC
        receiptToken: "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf", // cUSDCv3
        vaults: [
          "0xbC0033679AEf41Fb9FeB553Fdf55a8Bb2fC5B29e", // Reserve wrapped cUSDCV3
          "0xa8d818C719c1034E731Feba2088F4F011D44ACB3"
        ]
      }
    ]
  },
};

export type BaseConfigType = typeof baseConfig
export type BaseUniverse = Universe<BaseConfigType>;
