import curve, { PoolTemplate, getPool } from '../curve-js/src'
import { curve as curveInner } from '../curve-js/src/curve'

import { ethers } from 'ethers'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { DefaultMap } from '../base/DefaultMap'
import { ChainId, ChainIds } from '../configuration/ReserveAddresses'
import {
  CurveRouterCall,
  CurveRouterCall__factory,
  ICurveRouter,
  ICurveRouter__factory,
} from '../contracts'
import { Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { BlockCache } from '../base/BlockBasedCache'
import { wrapGasToken } from '../searcher/TradeAction'

export class CurvePool {
  [Symbol.toStringTag] = 'CurvePool'

  public readonly addressesInUse = new Set<Address>()

  public actionToken(index: number) {
    return this.underlyingTokens[index] === this.universe.nativeToken
      ? this.universe.wrappedNativeToken
      : this.underlyingTokens[index]
  }
  public readonly liquidity: () => Promise<number>
  public readonly balances: () => Promise<TokenQuantity[]>
  constructor(
    public readonly universe: Universe,
    readonly address: Address,
    readonly lpToken: Token,
    readonly tokens: Token[],
    readonly underlyingTokens: Token[],
    public readonly meta: PoolTemplate,
    readonly templateName: string
  ) {
    this.addressesInUse.add(address)

    this.balances = universe.createCachedProducer(async () => {
      const qtys = await Promise.all(
        this.underlyingTokens.map(async (token) => {
          return await this.universe.balanceOf(token, this.address)
        })
      )
      return qtys
    })

    this.liquidity = universe.createCachedProducer(async () => {
      const out = await this.balances()
      const prices = await Promise.all(
        out.map((i) => i.price().then((i) => i.asNumber()))
      )

      let sum = 0
      for (let i = 0; i < prices.length; i++) {
        sum += prices[i]
      }
      return sum
    })
  }

  get hasEth() {
    return this.underlyingTokens.some((t) => t.address === Address.ZERO)
  }

  public swapTypeUnderlying(i: number, j: number) {
    if (this.meta.isPlain || (this.meta.isCrypto && !this.meta.isMeta)) {
      return 1
    }

    const poolData = this.meta
    const swaptype =
      (poolData.isCrypto && poolData.isMeta && poolData.isFactory) ||
      (poolData.isLending && poolData.isFactory)
        ? 3
        : this.hasEth && poolData.id !== 'avaxcrypto'
        ? 1
        : 2
    return swaptype
  }
  getTokenIndex(token: Token) {
    let tokens = this.underlyingTokens
    if (this.meta.isPlain) {
      tokens = this.tokens
    }
    const out = tokens.indexOf(token)
    if (out === -1) {
      throw new Error(`Token ${token} not found in CurvePool ${this}`)
    }
    return out
  }
  toString() {
    let out = `CurvePool(${this.address.toString()}, name=${
      this.meta.name
    },tokens=${this.tokens.join(', ')}`
    if (this.underlyingTokens.length > 0) {
      out += `,underlying=${this.underlyingTokens.join(', ')}`
    }
    out += `,isPlain=${this.meta.isPlain}`
    return out + ')'
  }

  get poolType() {
    const nonNgImplementations = [
      '0xa85461afc2deec01bda23b5cd267d51f765fba10',
      '',
    ]
    let ngType = 1

    if (typeof this.meta.data.implementation === 'string') {
      if (!nonNgImplementations.includes(this.meta.data.implementation)) {
        if (this.meta.data.implementation.match(/(ng|ng2|ng-old|ng-old2)$/)) {
          ngType = 10
        }
      }
    }

    let baseType = 1
    if (this.meta.isCrypto) {
      const tokens = this.meta.isPlain ? this.tokens : this.underlyingTokens
      if (tokens.length === 2) {
        baseType = 2
      } else if (tokens.length === 3) {
        baseType = 3
      } else {
      }
    }
    return ngType * baseType
  }
}

const dontLoadPools = new Set(
  [
    '0xa498B08ca3C109e4EbC7Ff01422B6769EAEf16EF',
    '0x90Ce3285a9cce2D36149F12df2C1e357Af304A1D',
    '0x86Cf48e9735F84d3311141e8941b2494Fb4B8142',
    '0x7F787210c83012FCA364aE79aD8Fc26641c6fbE5',
    '0xd434eaf67bbA1903F61CdD3EDE6700caC74a5fF2',
    '0xC78d84Ee5D970227f988a2e2dC0A4a945163bCB9',
    '0xfCE1B5447a3DB7e18352e8ae4bCD780029012383',
    '0xEc1F6Df37B16432E520942Affe28149bAdc5bC5e',
    '0x5A784386DBe8E9188b7262e85dCAF912bcDDa441',
    '0xD0A7a9c7F2C148DC5399d89220345B50D6d13Cc0',
    '0x9bFb082f2dd5d63907aFa33Dbb8F9c0BCd5C2333',
    '0xc170ECB895b28a7eff0109f8C072aE742B1Dcb69',
    '0x316D2606cE036Ec0E69A11432A870a4ec66AdE96',
    '0x450a0975DbF787Df053d20FA3B57e5b362960102',
    '0x1A8E46721F754660dC8b2EF623e7408856A63caC',
    '0x92971A40Fa0F6Dd573a0f996b62De497eCC4ef6c',
    '0xE02D418e3d522611e88ce6070A9037eCf0b16073',
    '0x740f335D454Ad0dB55F88c02Cccd74Ed84F72A3f',
    '0x183F03C8ce2A24F388A4059aDEdd05C902650174',
    '0x61FDdD212F02F46fEa58DDfE3BE92D07B1249bCC',
    '0x44550B7D4c045929eD6f77c466852553A1fcba22',
    '0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e',
    '0xc897b98272AA23714464Ea2A0Bd5180f1B8C0025',
    '0xCF95Ac3dAecDBf60152A16BDa8D8f8dB7d175B88',
    '0x904bE3cE7249447167051f239c832400CA28De71',
    '0xc22936D5ECE78C048D6E7fe5d9F77fb6cAA16Dbb',
    '0xB4E2F6A10176b0948B31C7Ac0DF710137a7536A2',
    '0xc4114E1EF346495333Fd966f65C2987e758c2189',
    '0x62b78594710474dA5f2453a24845E74bbaE664f5',
    '0x38cB9756c307Ab482b5d3cA9155CB507cF98aC04',
    '0xD0A5Ca7b57780240db17BB89773fda8F0eFCE274',
    '0xC288a9D9671C444D0FdB60D89d8105bdAe8c7685',
    '0x96fb2AB514CA569A1486C50339533ca4637B338B',
    '0xC68ffDdea3a77b456227B50EbFdCC3C33bc2a8a4',
    '0x62d1d9065b4C78964040b640ab404D86D8f68263',
    '0x365901dB5Adb4c789801f19D5F1F46c574783aD6',
    '0x751D3feFFed0890B76E9b86476CFEEAA1FcdA73D',
    '0x6b234F354edA8fAe082BE20DCf790Fd886B42340',
    '0x39567Db64F0b25Db2C35Fc7A4f60c3C5258e4654',
    '0x7D99469fB3A530136ec0Ab6981D64bc9fF81aD04',
    '0x840cBF6861137624E60380d5e915619885c5AA95',
    '0x141Be5d90C27Dc5C9199a57cb828Ca3CBD2C2D94',
    '0x9735d6530b0609bA8340Ecf61FEaCD922468c1e1',
    '0x7193d845f8991E27FfDCE54E78137dE036A6f743',
    '0xD304918b2Ef48a1184918e575CED08d3d04c37ad',
    '0xE6BbAf0B55ae430354B87a3f592dD5c8AD7A5E79',
    '0x9A7168Ea321121A8FaF52147fC596b73e07Ab8a3',
    '0x9488317BaD789eF9AE5b70D3Ef2fC12dF717Fba2',
    '0x3767fF3d26B7f9FB1870AE7Ebfc7e05f585EecFe',
    '0x7dCEaF64115ed0E3D5B3E18d0896004EAeb58B4B',
    '0x7Dc87E4e57C0ca6060374E0cE2a1cffB69ebC45A',
    '0xfAf83F9D84FAF25ed4ecbc1857f6AAdC3C1977C3',
    '0x3272C5D11644deBB2e9d04C302796EbE8DF35457',
    '0x970cf34837Aa1Ff611410533b69d708cba70739D',
    '0x514747fCaeC6a72d1dC5fcc1CBB6dd21FBaD5427',
    '0x098b69922A18639457B8490DB051B8854D33d2F3',
    '0x0F74dc493F1076247aefD5ba8Da677440D3Ba8a4',
    '0x1DF0Bae5add689D6BE57aC6fd18b1e4a27B4498B',
    '0x408CbC416DBF4168143B011bF5C297DA82cE03ed',
    '0x9db63040dbdEe832D0824220fc47361674058eF1',
    '0x18a315D2ac23eB39F0C1B0085EdfF555D484C58A',
    '0xf5d5305790c1af08e9dF44b30A1afe56cCda72df',
    '0xDe90bA7bb025F435B2A6f984Ef6Ea76D7c8BC853',
    '0x5e431F70690475bADbB88E16D3a49ED8c4434e09',
    '0x8dEC9CE89b1f6ca1A5C546bA72317F6A49828D81',
    '0x06bd8DC3FFC8E8CFACEB9c967A3132e5B944246b',
    '0x7a62Acf78407b4D02281c7c856E43fA24086Bf92',
    '0x9304BD73eC6Aad8236D91E88f67eC1EB80658DbA',
    '0x157cB788D3a40203A8f98696e7CDcb717befC796',
    '0xe2cf543C6E59EA683DA0c94be5Ec1088856DAff7',
    '0x632D58Ecd622322482d8BE083E58F43d2d8f3e8C',
    '0x67526Bd70bF857aBf2cA19A9f16E900aA27Eef08',
    '0xc878DD87D598Ece5D4900B5933C6a656227C528d',
    '0xbdB3dfE9CC89739fC47Dcad0ef689627eaec7B1A',
    '0x526aFb67A479D4e9b0154D4Cc1a44D47df91bf3e',
    '0x317412f33a4cb32B32CC8011F3D22accb599C520',
    '0xAa738040e9dbc91368dF782579CF1810A74e87FA',
    '0xA8b31C529F610DA93985C5eb36Bc788CdE3A1a2C',
    '0xEC3C1B7Ec905B618bD414d4dE1E75F2581aFdaCE',
    '0x44358617cABC3312B3EBeDa4f7d75351bC45B114',
    '0xdf7A6441d8Bcea3af7785e70EC46592C4F7527f7',
    '0xD2327AbFFF1290a08122Ec0813A51dd02e7C0536',
    '0x68175Aa7FeE7e6A4709640Ac8C912EC3C50b3AF5',
    '0x1BeD84BF9181C096Cf13ac00F26c0DCDF43acA91',
    '0xB0d7338967DbC155740D1c390270840865B357E7',
    '0x6c0d063ea20FCFE55150FA940c47bc9E7F0C7d14',
    '0x76EFd9e76B13eC99aB231A4FC871F8b0839f852c',
    '0xD23e7FcDB8808D47f375B467DCC602DDd75fB3C7',
    '0x8EC1338FE2B4a3310a5EA8F0c3825C4F889dbDb8',
    '0x580f14f3347473cF057dc22385d64CFF1339C739',
    '0x881601Cc3D9745baA32a836bee329F4430eEaBF3',
    '0x26a9fc81f4A61259C519b44BdF3BAdb978D720FC',
    '0x15D16cd42d4F001BD92277E636E429a831E6CBD4',
    '0xd61748773b8F67A7Cd7ED44Dd45a6182e16Fe95F',
    '0x325bBA6f3C1D99812E8059c04cBF95eb94557E06',
    '0x38f3800bc69E2FeA2af3335B8e3193Ea86f83173',
    '0xEcCAC93Dc63Dd92BE32F0cC112E709ef1DebaF16',
    '0x23C90B0dD38572311f0aD826F0B49740a44F1239',
    '0x9F7896679FC2A5dDc2Ffec9b42B155e7999e8a0a',
    '0x6c9Fe53cC13b125d6476E5Ce2b76983bd5b7A112',
    '0xED24FE718EFFC6B2Fc59eeaA5C5f51dD079AB6ED',
    '0x737bC004136f66aE3F8fd5a1199e81c18388097B',
    '0x08Eaf78d40abFA6C341F05692eB48eDCA425Ce04',
    '0x45a8CC73EC100306af64AB2CcB7B12E70EC549A8',
    '0x8DF0713B2a047c45a0BEf21c3B309bcEF91afd34',
    '0x1c65bA665ce39cfe85639227eccf17Be2B167058',
    '0xa0D35fAead5299Bf18eFbB5dEfd1Ec6D4AB4Ef3B',
    '0x01FE650EF2f8e2982295489AE6aDc1413bF6011F',
    '0xd1011B637F979a5d9093Df1B32e7736c289024F5',
    '0xaa6a4f8DDcca7d3B9E7ad38C8338a2FCfdB1E713',
    '0x6577b46a566aDe492ad551a315c04DE3Fbe3DbFa',
    '0x323b3a6e7a71c1b8C257606Ef0364D61df8AA525',
    '0xF74bEc4bcf432A17470e9C4F71542f2677B9AF6a',
    '0x07350D8c30D463179DE6A58764C21558DB66Dd9c',
    '0xC38cA214c7a82b1EE977232F045aFb6d425cfFf0',
    '0x8c1de7a8F8852197B109Daf75A6fbB685C013315',
    '0x943b7e761f34866DA12c9b84C99888Fe2Ef607c5',
    '0x649c1B0e70A80210bcFB3C4eb5DDAd175B90BE4d',
    '0xF70c5c65CF6A28E7a4483F52511e5a29678e4fFD',
    '0x63a1eC86cD45425f1409faBe4c1cF8C5FD32A3B1',
    '0xF8048E871dF466BD187078cb38CB914476319d33',
    '0xBA866791F98098df41C3187D4D5433be29215c79',
    '0x8e883b9628a0d995ad758597989624Ec19F3b971',
    '0x8D7b9C013F7f614cd870fad33E260E7a9a1D9b5b',
    '0xddA1B81690b530DE3C48B3593923DF0A6C5fe92E',
    '0xb9B19B9d771035c5d95e642bBea28927040B7117',
    '0xeA24Fbb49d3465770eE1b2BCF674258F9e233c75',
    '0x5D489d45c56E40B971E601CCbc506112A2004DA2',
    '0x7B881722f842D229bbA234f6B5E1d6f0C9BF054a',
    '0xa089A831DEc6dfddfd54659ea42C02083f9352d6',
    '0x7C0aA7653E013c3D50cE57b098Acc9e4e8a3cd89',
    '0xefd6746633F658953c10c34f570751377cCd5686',
    '0x7Dc1A7298347c2F6270d07a464bD4d6Dab2544E8',
    '0xe5513b15EA0449D26781B0Ef4f4E5040c9D3459D',
    '0xe547725FFe16b2FC61Aa5aDAB5B2860FFDA0008d',
    '0xB6038C73C9D97dd30B869461Fd286913e82d7F70',
    '0x7cb5A1FD5B2194c6c56e663Eb5CeB91bFBB97c09',
    '0xB4c73D52072DDe93b181c037eaaA9B0124d6Ebc9',
    '0x602a9Abb10582768Fd8a9f13aD6316Ac2A5A2e2B',
    '0x3f67dc2AdBA4B1beB6A48c30AB3AFb1c1440d35B',
    '0x73b7A9a5ac65d650c9af0bA71e82b2EE99E1b6fe',
    '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
    '0xA148BD19E26Ff9604f6A608E22BFb7B772D0d1A3',
    '0xBaaa1F5DbA42C3389bDbc2c9D2dE134F5cD0Dc89',
    '0xb1d9b4574077eb6ed75B791c7d090Ea1F8c93474',
    '0x0CE863FBB67A6a532323D1f81B8f0FCD5f5099FF',
    '0xA551F34fc641f76F17498840C0ABFEC608410065',
    '0xd6f6fA524D4C9f7a5cBC8Fb9145a70d8D7Ed6073',
    '0x7E96AE239b9328aCB57AF401D1f2B6Cf5b4Ab8de',
    '0xa1a5a5bdb258A951786285D74efe72882dEd7574',
    '0xa0efc8A6c0093360067F728bbB5a035032DF6947',
    '0x5500307Bcf134E5851FB4D7D8D1Dc556dCdB84B4',
    '0x8b0aFa4b63a3581b731dA9D79774a3eaE63B5ABD',
    '0x04EcD49246bf5143E43e2305136c46AeB6fAd400',
    '0x99aF0326ab1c2A68c6712a5622c1Aa8e4b35Fd57',
    '0xB6d9b32407BfA562D9211acDba2631a46c850956',
    '0x79cB6a84FbEC1FE2d66B705a1e7f6482C2993049',
    '0x91d9d17EFD378f38a48122AE6Ec01B2E83d1Ac98',
    '0x162B4Deefc73a5277b09Bd7A02D25Da73D66183D',
    '0x337ca39842C448030196693f3433332fF1CF3E41',
    '0x5FBa071ad473265df860271998e45FDb3d3E5812',
    '0x0CF8327b20a159f0CD99214c5305D49E9D8207F0',
    '0x5538e48bfe47749D2540D3cBe83fD50465bcb6c3',
    '0x0d1c65B28190cB88f328D2051c524A5c63d10EB5',
    '0xc58fDB8A50AB921A73535656A7c69387Dd863ff6',
    '0x96A3F551c99797998dC33E2D816D567db61EE1c2',
    '0x167dE3887eDEbE5012544373C5871481bD95Cc4e',
    '0xBCAA09F2873F87aB4bf3A6fE97991f4bCC959e7e',
    '0x55A8a39bc9694714E2874c1ce77aa1E599461E18',
    '0x21B45B2c1C53fDFe378Ed1955E8Cc29aE8cE0132',
    '0x48536EC5233297C367fd0b6979B75d9270bB6B15',
    '0x3CFAa1596777CAD9f5004F9a0c443d912E262243',
    '0x4e0915C88bC70750D68C481540F081fEFaF22273',
    '0x7F2aF2c7BFDAD063fF01DcEc077a216d95A0A944',
    '0x1cDF9650cd7c47dCfe63159924440E7A439B91f4',
    '0x04e7a76A910A499B8BBCAc18411aE68454AE348b',
    '0xD9DBF8469bcfA53CBc71874b59f62DBCdBe8656D',
    '0x154B0eCD38078819084E449eA1a657728fd37e43',
    '0x3F1B0278A9ee595635B61817630cC19DE792f506',
    '0x6Df0D77F0496CE44e72D695943950D8641fcA5Cf',
    '0x27A8697fBD2ed137d88E74132a5558FA43656175',
    '0xEB0265938c1190Ab4E3E1f6583bC956dF47C0F93',
    '0xAcCe4Fe9Ce2A6FE9af83e7CF321a3fF7675e0AB6',
    '0xD6Ac1CB9019137a896343Da59dDE6d097F710538',
    '0xC1BF385575E5FfC81e476d2346f050f139Ee9e38',
    '0xef04f337fCB2ea220B6e8dB5eDbE2D774837581c',
    '0xD4e2fdC354c5DFfb865798Ca98c2b9d5382F687C',
    '0x5133Da6Ba0474368Ad0398d953c8D31c1B75b82B',
    '0xE07BDe9Eb53DEFfa979daE36882014B758111a78',
    '0xbfCa1a72edd92FFf61a8c88f61D4e64E99232b4b',
    '0xFD484A99d21CA118f22871134f467B1ca3F842Aa',
    '0x19a0CA9a0dc2A5034F47DcC164169Cffd7ed2410',
    '0xE661672521C77ca87DBb2eac816d2ccF86197281',
    '0xB4018CB02E264C3FCfe0f21A1F5cfbCAAba9F61F',
    '0x20F3424fEc5194522a2621120d1EA7279161E216',
    '0xc12A73c46D49Fa0d7433C90291BC8D1A9EAe7B23',
    '0xF3456E8061461e144b3f252E69DcD5b6070fdEE0',
    '0x6E855d08f2984516c40C4246A385bA4A2eDFcd0A',
    '0xb2c248C0B0DB7d28dfa0123438B40Bb31FB8AA05',
    '0x799D141e83D88996C48B98A4f8EB3D96AB422DD3',
    '0x68cAa209c3b0E73Cc3e9CCF8d40978b07fbFFA96',
    '0x1F6bb2a7a2A84d08bb821B89E38cA651175aeDd4',
    '0xF039050dC36fD59Ff1117B14BFdFf92dFA9dE9Fc',
    '0xFEB0784F5D0940686143b3A025Af731Ee6A81197',
    '0x4D19E7fD118FD751fEa7c0324D7E7b0A3D05EbA4',
    '0xcbD5cC53C5b846671C6434Ab301AD4d210c21184',
    '0x611a95bf3cc0EF593f22c4E4D8EB4d6C937E006C',
    '0xec5ffef96c3EdEdE587DB2efA3ab4Deec414cE8F',
    '0x808dB6E464279C6A77a1164E0b34d64Bd6fB526E',
    '0xFF186c2ed2092c0AB0696292c51Ccd2C8d1C0795',
    '0xF4A3cca34470b5Ba21E2bb1eD365ACf68B4d4598',
    '0x29b2178F5f9FB4f775A2f1a7fEA685FFbA0fAe32',
    '0x9730e45Ca84076C0a9DF80A4f2058C8379eA3eCE',
    '0xE94A145A797622FE38A35036729229fc6B3132Cb',
    '0x49EAF5E4aC618c968dDCF588C000302F9bC3312D',
    '0x54888c0859A93E6ff679e4F9705E75BBB9557057',
    '0x72D6658e562739267994BB16b952E543f0F92281',
    '0x68a39B6EB2f9AD3A5E58808CDC4907dA260E44C8',
    '0x7878A141103d93cAc0D1010C48f999975B347138',
    '0xEd46F331F85BaD38bD99B60938C700c1a92Fd940',
    '0xDa5B670CcD418a187a3066674A8002Adc9356Ad1',
    '0xf7b55C3732aD8b2c2dA7c24f30A69f55c54FB717',
    '0x7E46fd8a30869aa9ed55af031067Df666EfE87da',
    '0x0309A528bBa0394dC4A2Ce59123C52E317A54604',
    '0xAf25fFe6bA5A8a29665adCfA6D30C5Ae56CA0Cd3',
    '0x5007c634BD59dd211875346A5D0cfd10DFD1CdC0',
    '0xb2C57D651dB0FcCc96cABda11191DF25E05B88b6',
    '0x6A274dE3e2462c7614702474D64d376729831dCa',
    '0xF43b15Ab692fDe1F9c24a9FCE700AdCC809D5391',
    '0xd8C49617e6A2C7584Ddbeab652368ee84954BF5c',
    '0x7472764C28f843bA246F294C44DE9456911A3454',
    '0x383aD525211B8A1A9c13532CC021773052b2F4f8',
    '0x17cd2d7C4DDf69897cc00E2943532C27259257c5',
    '0x7e89315262217144BDe231c3a08A0361566599c4',
    '0x5d859f3488ab3f1B2f19D06CEdD161A7db272494',
    '0xFdaD22c8f63B32ACa0d273D828875FcCDa3880E1',
    '0xdD238c928d177d775399D13eEcAb876486679268',
    '0xbF9702efefe1303A61b7c944b5741b773DD930a7',
    '0x9C6751593A1424108F53E5ad6754940FEDAA5bC0',
    '0x7E050cf658777cc1Da4a4508E79d71859044B60E',
    '0xfE4A08f22FE65759Ba91dB2E2CADa09B4415B0d7',
    '0x782115c863A05abF8795dF377D89AAd1AAdF4Dfa',
    '0xD0a1D2a9350824516ae8729b8311557BA7E55BFF',
    '0x5D898FD41875b14c1781fb497AeCAb8E9B24dfC9',
    '0x5114f86027d4c9a509Cba072B8135A171402C6d5',
    '0xdDBDCEBb989B1ef804338d6c9a902f91c2738936',
    '0x6e314039f4C56000F4ebb3a7854A84cC6225Fb92',
    '0xc77103e44914A9e5E30B9F58cD48e990b22Fb587',
    '0x2F0e2d1023Fd3757aA58be7020b0FC58C6A45187',
    '0x6bfE880Ed1d639bF80167b93cc9c56a39C1Ba2dC',
    '0x3991d59428A8f9F5C13526D92d58B23DA14230A0',
    '0x3081cfFCAc989cb6F3Af01DC5BC309D70F6C2884',
    '0x2AF0a09b3421240f32953FffB13D2D2B8d24fbaE',
    '0xAF693adE4596d45ac294ceab920Df0943afB54D9',
    '0x66A0962628BdE82Cb3ddA560f05264407f187827',
    '0x429cCFCCa8ee06D2B41DAa6ee0e4F0EdBB77dFad',
    '0xc000caBD8d5151CC15a47e5f093835af7B81D404',
    '0xaCf9cc3b3e8F4031131CD72e40a0FdAa99d3E209',
    '0xFB9a265b5a1f52d97838Ec7274A0b1442efAcC87',
    '0x785Af85CceB3BA1369925c5b43E90026343FC0bb',
    '0x7c0316C925E12eBfC55e0f325794B43eaD425157',
    '0x2448ec833EbAf2958330f91E5Fbe4F9C70C9e572',
    '0x1440AE2288345a78e753D0b1D679880031BcE653',
    '0x38c60BcCa6AE0FDBD34466Fe8999BE15ee4e699e',
    '0xcc659BBEA1E1580e9a9C89d8f268101F67A881E9',
    '0x87Ae54eA83B460B3819932595C090c23e03A99b4',
    '0x96421Bb962c47fE5CF784161f850F83d77919996',
    '0x58fF1F6b706D01A3F3129eaEb04B90133450cA9A',
    '0x84b209Ab30081322F124A0e3C96332F66652F9a9',
    '0x50AC42817A6De2997fA012C444896ab78A7e8DEa',
    '0x81dB1af4cAB88324D9391ef5d39EEB1Eeae621d1',
    '0x857110B5f8eFD66CC3762abb935315630AC770B5',
    '0x02498De890c66fA387E86E04d75AdaB9df4802F6',
    '0x0Db0A66daF641f812493C556A1e0f97379766276',
    '0x97130CC28e99d13CE1Ae41d022268B5cC7409CdA',
    '0x294B61367B4B36521291A6cc74f0B6037e4319D6',
    '0x7802eDb322e774609154a12813b6988cB74BFcf6',
    '0xB581299623520687B483CCFfd04BEe52e94B82A6',
    '0x056ef502C1Fc5335172bc95EC4cAE16C2eB9b5b6',
    '0x4d4140c05DFa65e3e38A7BF1bDa6e5B68Fbe2b80',
    '0xf514a54693Db2f3b4C43f78088d361b3F3A317A9',
    '0xc63Dff67Fe1B63004AB6C773022bA06847c11335',
    '0xa476bbe03eE08b1B9a15c72f752F22631657bb45',
    '0xC9f39993cF05f7442dD56ac2B87484C051FfdB5A',
    '0x9ED7A47CDEe1A197b338706145735B62778979cF',
    '0x71Db3764d6841D8B01Dc27C0Fd4A66A8A34b2BE0',
    '0x244c716Ed10d9137Bf65F1A21D9b88b598daC961',
    '0x703E226526D010734A3ea61c3F2b9c9c10197343',
    '0xB5ae2A6b084f59ff9EF6b2E79302A1878306D58c',
    '0x4B036A6769D5f1abb5A249a489348389C2907334',
    '0xCa6cF273AB17073248654363Aa00b102540aa5Ea',
    '0x8e6A81e03310A32d49D501D5d41eA20cDc204e74',
    '0xEcB16535477F9cc6Db8D8Ea70b36D5020499d91c',
    '0x02D7f419D731F718bDB22a3b03874C600bEC3a40',
    '0x1ebe895af819Eb97A008269C14422db82246A450',
    '0xc6cA529b988267602C86aE3D54ed3A3c9b48B909',
    '0x880d9F8945bC99Ee1C7E835CCB2a367FE22dC30A',
    '0x91c8C77829c909BF2178dfa173C96165D3A8C11A',
    '0xB09Fc8bbdcc8DC9d8b3775132c52fCEbf1c7Dbb3',
    '0x37f56017AA5530aE489802626F3bC59b87eab5aE',
    '0xe7ad3016d46E538C9Ca87e5071C561A73eD1c98c',
    '0x9429E06FFD09Cf97007791B8bF3845171f1425E8',
    '0x9Be7685aF8A6184F5889F12892f16452Fe73f8fd',
    '0x019F398b084D7702CFB7430AA9d545bF55de037f',
    '0x6962e20Fb648611801aDee8c24Af9f7fCE2034A8',
    '0xF99514d6556DEE14032CEb3f1cd59B32e61541cc',
    '0xAc5f019a302c4c8caAC0a7F28183ac62E6e80034',
    '0x8561D7A37a998196CafAb7432E3243b413DC187E',
    '0xBFc3D05453dDDB38289eA44386A9A4f8226Ef2ca',
    '0xA3f78Ffb9dE17d7A530EE08B4aA13362eDD7c76b',
    '0xf3749a2beF435535200C378298b78F34DCac0Fc9',
    '0x0b036D098CB2A2cce97CdDc6187bcAdaEb2F8075',
    '0x1C379572160a80975fA1DaD8e491Ff485611C8f6',
    '0xC2F5FeA5197a3d92736500Fd7733Fcc7a3bBDf3F',
    '0x08DA2b1EA8f2098D44C8690dDAdCa3d816c7C0d5',
    '0x4d8842511cAdcC65125Cb9353B9520cc7f424688',
    '0x3Fb78e61784C9c637D560eDE23Ad57CA1294c14a',
    '0x1c4D2495F1B9f325cb72c1Af0dB29985239C68aD',
    '0xf03bD3cfE85f00bF5819AC20f0870cE8a8d1F0D8',
    '0x9f6664205988C3bf4B12B851c075102714869535',
    '0x7a5B529Bf0106990494Ab3d7696f14C69c000dD7',
    '0x7a2517768A221b43a639F7f03A88074D9884B398',
    '0xBCE4E65b4A68Ac2095C7747992250D2075d82edc',
    '0xfD268D70C4446862A0FC024fb731d71F3FC5b6C4',
    '0xf5A95ccDe486B5fE98852bB02d8eC80a4b9422BD',
    '0xFD5dB7463a3aB53fD211b4af195c5BCCC1A03890',
    '0x870754e9Cb1555c427dd7b433A55aEAcCd7e4e1F',
    '0xc8a7C1c4B748970F57cA59326BcD49F5c9dc43E3',
    '0x67d9eAe741944D4402eB0D1cB3bC3a168EC1764c',
    '0xDce8Dfa05F9af2c16793F6b8e77597B7B7BF0c50',
    '0x588eab5777e51ecE898bB71976715072E6F7843F',
    '0x3b22B869ba3c0a495Cead0B8A009b70886d37fAC',
    '0x6d8fF88973b15dF3e2dc6ABb9aF29Cad8C2B5Ef5',
    '0x06d39e95977349431E3d800d49C63B4D472e10FB',
    '0xbB2dC673E1091abCA3eaDB622b18f6D4634b2CD9',
    '0x8B8DBc5b2A0D07dF180B1186F179F1c6a97C8AaE',
    '0xF05CFb8b4382c69f3B451C5FB55210B232E0edFA',
    '0x9462F2b3C9bEeA8afc334Cdb1D1382B072e494eA',
    '0x0FaFaFD3C393ead5F5129cFC7e0E12367088c473',
    '0x7abD51BbA7f9F6Ae87aC77e1eA1C5783adA56e5c',
    '0x9CA41a2DaB3CEE15308998868ca644e2e3be5C59',
    '0xCaf8703f8664731cEd11f63bB0570E53Ab4600A9',
    '0x5D4D6836260c116B959E7E25a1735B6C7C328f47',
    '0x50B0D9171160d6EB8Aa39E090Da51E7e078E81c4',
    '0x96AAE323E111A19b1E0e26F55e8De21F1dD01f26',
    '0xC250B22d15e43d95fBE27B12d98B6098f8493eaC',
    '0x9001a452d39A8710D27ED5c2E10431C13F5Fba74',
    '0x961226B64AD373275130234145b96D100Dc0b655',
    '0xE95E4c2dAC312F31Dc605533D5A4d0aF42579308',
    '0xDB8Cc7eCeD700A4bfFdE98013760Ff31FF9408D8',
    '0x0437ac6109e8A366A1F4816edF312A36952DB856',
    '0xF38a67dA7a3A12aA12A9981ae6a79C0fdDdd71aB',
    '0x4606326b4Db89373F5377C316d3b0F6e55Bc6A20',
    '0xeE98d56f60A5905CbB52348c8719B247DaFe60ec',
    '0xdE495223F7cD7EE0cDe1AddbD6836046bBdf3ad3',
    '0xE60986759872393a8360A4a7abEAb3A6e0BA7848',
    '0xdaDfD00A2bBEb1abc4936b1644a3033e1B653228',
    '0xD7C10449A6D134A9ed37e2922F8474EAc6E5c100',
    '0x5a59Fd6018186471727FAAeAE4e57890aBC49B08',
    '0x5eC58c7DEF28e0C2470cb8bd7Ab9C4ebEd0a86b7',
    '0x67C7f0a63BA70a2dAc69477B716551FC921aed00',
    '0x4e43151b78b5fbb16298C1161fcbF7531d5F8D93',
    '0xc9C32cd16Bf7eFB85Ff14e0c8603cc90F6F2eE49',
    '0x83D78bf3f861e898cCA47BD076b3839Ab5469d70',
    '0x66E335622ad7a6C9c72c98dbfCCE684996a20Ef9',
    '0x0AaCe9b6c491d5cD9F80665A2fCc1af09e9CCf00',
    '0x92Da88e2e6f96cC7c667Cd1367BD090ADF3c6053',
    '0xc5481720517e1B170CF1d19cEaaBE07c37896Eb2',
    '0x875DF0bA24ccD867f8217593ee27253280772A97',
    '0xD4cEdEf74fB8885b8e1dE21fBA5a2E2F33F21f58',
    '0xC69b00366F07840fF939cc9fdF866C3dCCB10804',
    '0x23afFc32cBe3c1a2a79376361A2D6f51CA7C9005',
    '0xC0Ec468c1B6B94a107B0A83c7a0f6529B388f43A',
    '0x27f715999252a6E4d4794b4c9ff2Ce3D6ea8Fd9B',
    '0xEC0de6A9da9cc464Da0011214D586C21f1Fbe6D4',
    '0x97Ba76a574bC5709b944bB1887691301c72337Ca',
    '0x8D35ECe39566d65d06c9207C571934DD3C3a3916',
    '0x79E281BC69A03DaBCcD66858c65EF6724e50aebe',
    '0x0245918fA513E0641509bb519389A49258A2699F',
    '0x400d4C984779A747462e88373c3fE369EF9F5b50',
    '0xfC8c34a3B3CFE1F1Dd6DBCCEC4BC5d3103b80FF0',
    '0x3685646651FCcC80e7CCE7Ee24c5f47Ed9b434ac',
    '0x6D09C6513e620778632D36784F5C3b4b2309bd96',
    '0x663aC72a1c3E1C4186CD3dCb184f216291F4878C',
    '0xfcc067EFb7bE2EEbD32615F14fC22195abB68e9B',
    '0x4424b4A37ba0088D8a718b8fc2aB7952C7e695F5',
    '0x06c21B5d004604250a7f9639c4A3C28e73742261',
    '0x7C0d189E1FecB124487226dCbA3748bD758F98E4',
    '0xbC90FEC043e6DF6A084E18Df9435Ee037C940B2d',
    '0x8e9De7E69424c848972870798286E8bc5EcB295F',
    '0x35dd22fC3eC5a82D207BEDd8FA1F658915F97C33',
    '0x0ce6e42EDadA12C4D862415aEa7C82bce93426d5',
    '0xB00eA2Bcad321850Bc8055e7C311b05d54875CaD',
    '0xC1E894613A404A49c4200FCE3F7D3F29918d2b93',
    '0x9A6F2FfA30CDDBB6156B98AC88a546E81205f6Ba',
    '0xfC89b519658967fCBE1f525f1b8f4bf62d9b9018',
    '0xC2d54fFb8a61e146110d2fBdD03b12467Fe155ac',
    '0xDd9E687c73A2031A8f5058B596d740f53c1cb220',
    '0x320B564Fb9CF36933eC507a846ce230008631fd3',

    '0x1dff955cddd55fba58db3cd658f9e3e3c31851eb',
    '0x595146ed98c81dde9bd23d0c2ab5b807c7fe2d9f',
    '0x6525e7e2e8450741ab97bd3948bfa47878f83ec6',
    '0x039fd59541b3989c7a1e9278431038b3b6ba5f43',
    '0xd3301b7caa76f932816a6fc7ef0b673238e217ad',
    '0xb2e2536821521174a168eda7be78a6c70ea6e5fa',
    '0x58257e4291f95165184b4bea7793a1d6f8e7b627',
    '0x21d158d95c2e150e144c36fc64e3653b8d6c6267',
    '0xbec570d92afb7ffc553bdd9d4b4638121000b10d',
    '0x4149d1038575ce235e03e03b39487a80fd709d31',
    '0x31c325a01861c7dbd331a9270296a31296d797a0',
    '0xd9f907f7f84cbb0af85c7829922fd692339147f9',
    '0x75a1fda374fdb4e47d703d0282e94c87119fa46e',
    '0x13b876c26ad6d21cb87ae459eaf6d7a1b788a113',
    '0x825722af244432319c1e32b6b18aded2d4a014df',
    '0x02dfa5c793a9ce4d767a86259245a162a57f2db4',
    '0xc7a87b0f491c1a043eb5315281163556b7f36f7f',
    '0x1631d0e588d475cee4be0f51b7410daaaabd7034',
    '0x372463c1dfe3a9c269c2c5eb76a86021c637d0f4',
    '0xb49b238ab6106216dc26854ed3a009eac1c419a9',
    '0xdcb11e81c8b8a1e06bf4b50d4f6f3bb31f7478c3',
    '0x6d91a9cf0dea0cd5bcb676eb4b1f11b6dcb44188',
    '0x7f87a8b46a662131b87d29b2316b2d9cbd7e3b02',
    '0x52f05c70d86662204c7222c35000747b177c393a',
    '0xbe084cf7db8fdfd6f17c041f958abccaf8c76603',
    '0x3e3c6c7db23cddef80b694679aaf1bcd9517d0ae',
    '0x6a6283ab6e31c2aec3fa08697a8f806b740660b2',
    '0xaeb6f2abe64ee5ed210e8ae33b1f0f5e4b3e28fc',
    '0x96f34bb82fca57e475e6ad218b0dd0c5c78df423',
    '0x17374bdbcb79ae20cb947640915316d379a7f222',
    '0xf4e7c1e5a21f68df8d6a331affbeebc313ed24d1',
    '0x3cc1b5dce81a810080890fb8adad48f8eaa8c210',
    '0xfc1e8bf3e81383ef07be24c3fd146745719de48d',
    '0x6575ad173801f2d58961b3d7f3628c72346ea84a',
    '0xee0dcaf26aa271ff18bb9b9b282620a7ce79f6ba',
    '0x867fe27fc2462cff8890b54dfd64e6d42a9d1ac8',
    '0xa246ed2954539f2eaa8e1fb72e02637f2a402ab7',
    '0x6868eb3fcefe1684486f601d2dc10bbf0c4eeb8b',
    '0x53dfcf5ca1e1d5311db29f585d56a9a9dcc2441b',
    '0x51bcba35e5fa277592cea83ad14408a0963b86f8',
    '0x4cc9385d9909d2bf529a4c1e847dc4ee01f4927a',
    '0x675993fb30a2d58cd4d29d15f89b4be9ca8765ae',
    '0x6c5acd4c044defe22fec287d1362b1af5ed16f7a',
    '0x593807b540d2584fd16433dc609f869421577173',
    '0x50e29cd32bedf8adf6c58cf0f8f2c64cb98c62ac',
    '0x7ce013171826feb235ed3fd4ba0171e64ac97d2b',
    '0x3d2253fa44c38d9870539dc2856286aa1638467f',
    '0xabf03448f97708f06fb1caa5b58a30247f024d19',
    '0x56e9bac9e21b9390b3344320b33f7abe776ed35f',
    '0xf5ed6024c08fca91f85a20ad364a4f3994f3ecae',
    '0xaf4264916b467e2c9c8acf07acc22b9edddadf33',
    '0x7e650c700b0801e717b352e55a582afd928aa094',
    '0x031af153efbc75a88110cb3b94eafbec847a526f',
    '0x53e4a076b62667e8c8aae13b8edc793e9a5f3fed',
    '0x0d8bc03c14a135783b135d51b256997def69175c',
    '0xbc41efcacbd94241f2c89443e2832b31fbe6eb22',
    '0xe7a59b3b44acacfd8a5ba9259d6913f097946409',
    '0xce756104d10e1fdc60c9c32a84b1bb19712e52ba',
    '0xee3dd0cb1a8175b69e1cd6e354b9dc1629f3e8b5',
    '0x5f5fe47fed55eae627386995198294c39e1d17a5',
    '0x5f2bb3ded5de76644e2a033acedce6e93b4a3efc',
    '0x713060278d13dfdba6c7b58adebaf8b57213c904',
    '0xa7b0e924c2dbb9b4f576cce96ac80657e42c3e42',
    '0xed09ca8275dffb09c632b6ea58c035a851f73616',
    '0xc8781f2193e2cb861c9325677d98297f94a0dfd3',
    '0x9f4a88da14f2b6dbc785c1db3511a53b8f342bde',
    '0xf0c081020b9d06eb1b33e357767c00ccc138be7c',
    '0x679ce2a8b3180f5a00e0dcca26783016799e9a58',
    '0x8083b047e962ca45b210e28ac755fbda3d773c5b',
    '0x5b78b93fa851c357586915c7ba7258b762eb1ba0',
    '0xd05ce4ab1f4fb0c0e1b65ebe3ed7f2dcfc6ccf20',
    '0x97aeb34ac6561146dd9ce191efd5634f6465def4',
    '0x9809f2b973bdb056d24bc2b6571ea1f23db4e861',
    '0xeb07fcd7a8627281845ba3acbed24435802d4b52',
    '0x6f80b9543dd5a0408f162fe2a1675db70a2cb77d',
    '0xbf5d9decccc762fa7b5eb9fac668c803d42d97b6',
    '0x9558b18f021fc3cba1c9b777603829a42244818b',
    '0xee60f4a3487c07b4570ccffef315401c4c5744c8',
    '0x8116e7c29f60fdacf3954891a038f845565ef5a0',
    '0x2ed1d3e7771d64feed7ae8f25b4032c8dd2d0b99',
    '0x50c8f34cea0e65535fc2525b637ccd8a07c90896',
    '0x642562115cf5a5e72ab517e6448ec8b61843dac9',
    '0x48fcffa86fb24bdeb45b5739f7ced24095a7c8e8',
    '0xb3bc1833ac51aacea92acd551fbe1ab7edc59edf',
    '0x85f102be3a76165be9668be0bf36e906a488fd33',
    '0x87872be0c56ef97156f2617b3083d22423fc62e9',
    '0x8b3138df9aa1f60648c65c67d6ff646be305788b',
    '0xb548e49bb6f33a77885836723b73ef9c8dbc047b',
    '0x3dcc3ac50cb42f7e443d7f548dd2c48edaa8f59a',
    '0x172a54ba45783049216f90f85fe5e5f6bc1c08fe',
    '0xf08dbd81fcc712004e6943454c83c52de963cdec',
    '0x9fe520e629a7f0dec773a3199bfe87620e5aea74',
    '0xb2111b55edd1cb5d2c18a6817e21d473fe0e5ba1',
    '0xa23d59fa2505638861525f8cb3005fec7bd37b5b',
    '0xb90a850a0802b9f281babea836292aadd1011972',
    '0x9d0de74de698d1ba7273d09193ec20a1f6cb7d6a',
    '0xec4acc9322fc4dc853e8f72631d2c95556c68ec0',
    '0x3d675a52f5b572eb5c61fc5088203ac9b16bfc70',
    '0x04f0fae3dd0a9904f797deb15c3e523342112811',
    '0x0b049eb31878176b278ef84a66810d311353dc94',
    '0x5239063a86e1e251ee6fb3ab4fb67dea3a8e1fd2',
    '0x930792bd0fb4593063ad2ee12e86d768bd8df7a1',
    '0xb5fc990637f15be6420341845a64101b6bbe365d',
    '0xabe43b60f8337818c21101ab78b5b216789e19dd',
    '0xdab9eeee607f7952680e9433787e4ede244a8515',
    '0x62cec7899a9910e48f0deeab755429887b6e1979',
    '0x00f93fbf00f97170b6cf295dc58888073cb5c2b8',
    '0x982da76f0ccf868b558bd46d7a3b58bc2662d7cc',
    '0x578b27e257050b6011dfdcd69f67696ef24279fc',
    '0xb4698193bcbc49be01fcfc67c144ea4927166355',
    '0x188abea43270791f96dc9209e239f7b79e61203b',
    '0x28b0cf1bafb707f2c6826d10caf6dd901a6540c5',
    '0x8e27f0821873b6f5421b6ca75a4c5e1e83d3e77a',
    '0x6a0861625937cb3629066cc6db88808a590b9c68',
    '0x498ad3352ccfaed237a91f6933a92a7a43917b72',
    '0xd82C2eB10F4895CABED6EDa6eeee234bd1A9838B',
    '0xd6b03059c882f63268dd3e1a98d8e3cdee26919c',
    '0xa15e8f7e1e031e4f6f11053c6d320b2a8dc6742c',
    '0x6a52e339a4b8abd15707f882d6adc05875ec5223',
    '0xa98794accdb3996c7ef015a354b6e1add2d2ce3e',
    '0xe82805a9b880e6dc520b6f017537f7781d55217f',
    '0xd511b5c309b2f7256ff7b3d41b029afb96c7a331',
    '0xa77b5d170f3aec2f72ca06490a7b9383a70ae5eb',
    '0x1400e08f1d9f5bc90ae19acd4bf81beabc9e79de',
    '0x9fd7e5b614fa071ff3543b44b68ef7699cec4af5',
    '0x166bddea59c13179796653b8aff13eea1bd81a97',
    '0x613398aecdaf6bcb6edb8e61e5956794d23f7412',
    '0xa500cd4e520682e1b1113e1055d55bacead61122',
    '0xfd46b54fcff753ba058a5e9bbb45dcedc9a71fab',
    '0x3c565d9151073e8e5002b61dc570f43a139cafe7',
    '0x84997fafc913f1613f51bb0e2b5854222900514b',
    '0xf52e248ccfbf189df0c5a4b15e9f72fa10c7fe59',
    '0xf275cadbe0343541ce49a03e385f8b234544cda8',
    '0x08f9dd845d0c91b918bb90cc5b124f3fd3e98f3a',
    '0x1cc1772c8899ad2a35ade9b9978a56254cfc64a0',
    '0x968dee60c67c184f9808510ec92d990e7e6616c2',
    '0xd8a114e127aa5b9f20284fc7a1bdf2bc6853a28d',
    '0x83fc85f144bbec4234e690b6451b105f3d7c60e4',
    '0x37f1d67a5ac27b7c2d0f664e73ccbb82627ac4a5',
    '0xcd0148e3f3350f4b98a48535f63a38fc630e80f1',
    '0x1f98249637bb42edb072dd2a8add44aeb80da218',
    '0x7b42d77bd2fee3c98baa58d559b83ff3bb4702cf',
    '0x50122108f7b3b10ac219d066275087d37e4f4a61',
    '0x110cc323ca53d622469edd217387e2e6b33f1df5',
    '0xffc78332f0da6fbaabdacfe8054ccbc501eed432',
    '0xc71bc7e33510aea215e4776867148fa25c368795',
    '0x0bbe64ea3cf57fdfdfd621f334b3469627a022ad',
    '0x02914596cad247c86e8f7d8464d1b3dbd0cec86e',
    '0x48c6b29893ec0320e1cd10227b8c2f26eb342a83',
    '0xab3435bd2959fd713f7e50389ff374bfee2e3b4b',
    '0x9a64dec8da8ce892ff711d715d9a8fc82e966a44',
    '0xc3fe3eedd7002842f2971183b5e87f89cc1ee848',
    '0xed43cb0dd25a1fa4dbd456f52c9fbb782f20eae1',
    '0x8d6ed9ba971cf08441fc542acecd35f691afa752',
    '0x212a60171e22988492b7c38a1a3553c60f1892be',
    '0x4029f7dcbdf6059ed80da6856526e7510d64fa21',
    '0x386ec09db6f961b9e28b3dab174ad9567e57b90c',
    '0x14756A5eD229265F86990e749285bDD39Fe0334F',

    '0x383e6b4437b59fff47b619cba855ca29342a8559',
    '0xaec7db1be1be14af32d00bbf31487a03cb6925ed',
    '0x02ac4107893ba767177d69851dcd87bedc63ab22',
    '0x73069892f6750ccaaababadc54b6b6b36b3a057d',
    '0x6e8d2b6fb24117c675c2fabc524f28cc5d81f18a',
    '0x5105a9e847965421a8c81ca33ea682948694a6f4',
    '0x1005f7406f32a61bd760cfa14accd2737913d546',
    '0x270d74e9cc8dc75ef55d91c0d469e3285e581e77',
    '0x428d03774f976f625380403e0c0ad38980943573',
  ].map(Address.from)
)
const routerAddresses: Record<ChainId, Address> = {
  [ChainIds.Mainnet]: Address.from(
    '0x16C6521Dff6baB339122a0FE25a9116693265353'
  ),
  [ChainIds.Base]: Address.from('0x4f37A9d177470499A2dD084621020b023fcffc1F'),
  [ChainIds.Arbitrum]: Address.from(
    '0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D'
  ),
}

export class CurveSwap extends Action('Curve') {
  public get actionName() {
    return `swap`
  }

  public async liquidity(): Promise<number> {
    return await this.pool.liquidity()
  }

  public toString() {
    return `${
      this.protocol
    }.${this.pool.address.toShortString()}.swap(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
  public get oneUsePrZap() {
    return true
  }
  public get supportsDynamicInput() {
    return true
  }
  public get returnsOutput() {
    return true
  }

  public get addressesInUse() {
    return this.pool.addressesInUse
  }

  get outputSlippage() {
    return 1n
  }

  private routeParams(plan: boolean = false) {
    const route: string[] = []
    const swapParams: number[][] = []

    let inputTokenAddr =
      this.pool.underlyingTokens[this.inputTokenIndex].address.address
    let outputTokenAddr =
      this.pool.underlyingTokens[this.outputTokenIndex].address.address
    if (plan) {
      if (
        this.pool.underlyingTokens[this.inputTokenIndex] ===
        this.universe.nativeToken
      ) {
        route.push(
          this.universe.wrappedNativeToken.address.address,
          this.universe.wrappedNativeToken.address.address
        )
        swapParams.push([0, 0, 8, 0, 0])
        inputTokenAddr = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      }
    }

    type SwapParams = [number, number, number, number, number]
    route.push(inputTokenAddr, this.pool.address.address, outputTokenAddr)
    swapParams.push([
      this.inputTokenIndex,
      this.outputTokenIndex,
      this.pool.swapTypeUnderlying(this.inputTokenIndex, this.outputTokenIndex),
      this.pool.poolType,
      this.pool.underlyingTokens.length,
    ])

    if (plan) {
      if (
        this.pool.underlyingTokens[this.outputTokenIndex] ===
        this.universe.nativeToken
      ) {
        swapParams.push([0, 0, 8, 0, 0])
        route.push(
          this.universe.wrappedNativeToken.address.address,
          this.universe.wrappedNativeToken.address.address
        )
      }
    }

    while (route.length !== 11) {
      route.push(ethers.constants.AddressZero)
    }
    while (swapParams.length !== 5) {
      swapParams.push([0, 0, 0, 0, 0])
    }
    if (route.length !== 11 || swapParams.length !== 5) {
      throw new Error('Invalid route or swap params')
    }
    return {
      route: route as [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
      ],
      swapParams: swapParams as [
        SwapParams,
        SwapParams,
        SwapParams,
        SwapParams,
        SwapParams
      ],
      // pools: [
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      //   ethers.constants.AddressZero,
      // ] as [string, string, string, string, string],
    }
  }

  // @notice Performs up to 5 swaps in a single transaction.
  // @dev Routing and swap params must be determined off-chain. This
  //       functionality is designed for gas efficiency over ease-of-use.
  // @param _route Array of [initial token, pool or zap, token, pool or zap, token, ...]
  //               The array is iterated until a pool address of 0x00, then the last
  //               given token is transferred to `_receiver`
  // @param _swap_params Multidimensional array of [i, j, swap_type, pool_type, n_coins] where
  //                     i is the index of input token
  //                     j is the index of output token

  //                     The swap_type should be:
  //                     1. for `exchange`,
  //                     2. for `exchange_underlying`,
  //                     3. for underlying exchange via zap: factory stable metapools with lending base pool `exchange_underlying`
  //                         and factory crypto-meta pools underlying exchange (`exchange` method in zap)
  //                     4. for coin -> LP token "exchange" (actually `add_liquidity`),
  //                     5. for lending pool underlying coin -> LP token "exchange" (actually `add_liquidity`),
  //                     6. for LP token -> coin "exchange" (actually `remove_liquidity_one_coin`)
  //                     7. for LP token -> lending or fake pool underlying coin "exchange" (actually `remove_liquidity_one_coin`)
  //                     8. for ETH <-> WETH, ETH -> stETH or ETH -> frxETH, stETH <-> wstETH, frxETH <-> sfrxETH, ETH -> wBETH, USDe -> sUSDe

  //                     pool_type: 1 - stable, 2 - twocrypto, 3 - tricrypto, 4 - llamma
  //                                 10 - stable-ng, 20 - twocrypto-ng, 30 - tricrypto-ng

  //                     n_coins is the number of coins in pool

  // @param _amount The amount of input token (`_route[0]`) to be sent.
  // @param _min_dy The minimum amount received after the final swap.
  // @param _pools Array of pools for swaps via zap contracts. This parameter is only needed for swap_type = 3.
  // @param _receiver Address to transfer the final output token to.
  // @return Received amount of the final output token.
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const [output] = await this.quote(predicted)
    const lib = this.gen.Contract.createLibrary(this.routerCall)

    const { route, swapParams } = this.routeParams(true)

    const minOut = 0n // output.amount - output.amount / 5n
    // function exchangeNew(
    //     uint256 amountIn,
    //     bytes memory encodedRouterCall
    // ) external returns (uint256) {
    //   (
    //     address[11] memory route,
    //     uint256[5][5] memory swapParams,
    //     uint256 expected,
    //     address router
    // ) = abi.decode(
    //     encodedRouterCall,
    //     (address[11], uint256[5][5], uint256, address)
    // );
    const encodedStaticData = ethers.utils.defaultAbiCoder.encode(
      ['address[11]', 'uint256[5][5]', 'uint256', 'address'],
      [route, swapParams, minOut, this.router.address]
    )

    return [
      planner.add(
        lib.exchangeNew(input, encodedStaticData),
        `Curve: Swap ${predicted.join(', ')} -> ${output} on pool ${
          this.address
        }`,
        `crv_${this.address.toShortString()}_${this.inputToken.join(
          '_'
        )}_${this.outputToken.join('_')}`
      )!,
    ]
  }

  get isTrade() {
    return true
  }

  get dependsOnRpc() {
    return true
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const outputQty = await this.quoteCache.get(amountIn.amount)
    return [outputQty]
  }

  private quoteCache: BlockCache<bigint, TokenQuantity>
  public gasEstimate() {
    return this.gasEstimate_
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurvePool,
    public readonly inputTokenIndex: number,
    public readonly outputTokenIndex: number,
    private readonly gasEstimate_: bigint,
    private readonly router: ICurveRouter,
    private readonly routerCall: CurveRouterCall
  ) {
    super(
      pool.address,
      [pool.actionToken(inputTokenIndex)],
      [pool.actionToken(outputTokenIndex)],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          pool.actionToken(inputTokenIndex),
          Address.from(router.address)
        ),
      ]
    )
    this.quoteCache = this.universe.createCache(
      async (amount: bigint) => {
        const { route, swapParams } = this.routeParams()
        const out = await this.router.callStatic[
          'get_dy(address[11],uint256[5][5],uint256)'
        ](route, swapParams, amount)

        const outputQty = this.outputToken[0].from(out)

        // console.log(`${this}: ${this.inputToken[0].from(amount)} -> ${outputQty}`)
        return outputQty
      },
      12000,
      (i) => (i / 100n) * 100n
    )
  }
}

export const loadCurve = async (universe: Universe) => {
  const router = routerAddresses[universe.chainId as ChainId]
  if (router == null) {
    throw new Error(`No router address for chain ${universe.chainId}`)
  }
  const routerInst = ICurveRouter__factory.connect(
    router.address,
    universe.provider
  )

  const loadCurvePools = async (universe: Universe) => {
    // const batcher = new ethers.providers.JsonRpcBatchProvider(p.connection.url)
    await curve.init(universe.provider, () => ({
      gasPrice: universe.gasPrice,
      maxFeePerGas: universe.gasPrice + universe.gasPrice / 10n,
    })) // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically

    await Promise.all([
      curve.fetchFactoryPools(true),
      curve.fetchCryptoFactoryPools(true),
    ])

    const poolsUnfiltered = [
      ...curve.getPoolList(),
      ...curve.getCryptoFactoryPoolList(),
      ...curve.getFactoryPoolList(),
    ]

      .map((id) => {
        try {
          const pool = getPool(id)
          const poolAddress = Address.from(pool.address)
          if (dontLoadPools.has(poolAddress)) {
            return null
          }

          return {
            name: pool.name,
            pool,
            poolAddress,
            underlyingCoinAddresses: pool.underlyingCoinAddresses.map(
              Address.from
            ),
            wrappedCoinAddresses: pool.wrappedCoinAddresses.map(Address.from),
          }
        } catch (e) {
          return null
        }
      })
      .filter((i) => i != null)

    const pools = poolsUnfiltered.filter(
      (p) =>
        p.pool.underlyingDecimals.every((i) => i !== 0) &&
        p.pool.wrappedDecimals.every((i) => i !== 0)
    )

    const tokenAddresses = [
      ...new Set(
        pools

          .map(({ pool }) =>
            pool.wrappedCoinAddresses
              .concat(pool.underlyingCoinAddresses)
              .map((a) => Address.from(a))
          )
          .flat()
      ),
    ]
    const badTokens = new Set<string>()
    await Promise.all(
      tokenAddresses.map(async (address) =>
        universe.getToken(address).catch((e) => {
          badTokens.add(address.address.toString())
        })
      )
    )
    const curvePools = await Promise.all(
      pools.map(async ({ name, pool }) => {
        try {
          const tokens = pool.wrappedCoinAddresses.map(
            (a) => universe.tokens.get(Address.from(a))!
          )
          const underlying = pool.underlyingCoinAddresses.map(
            (a) => universe.tokens.get(Address.from(a))!
          )

          const lpToken = await universe.getToken(Address.from(pool.lpToken))

          return new CurvePool(
            universe,
            Address.from(pool.address),
            lpToken,
            tokens,
            underlying,
            pool,
            name
          )
        } catch (e) {
          console.log(e)
          return null!
        }
      })
    )
    return curvePools.filter((i) => i !== null)
  }

  const addLpToken = async (universe: Universe, pool: CurvePool) => {
    const lpToken = await universe.getToken(Address.from(pool.meta.lpToken))

    if (universe.lpTokens.has(lpToken)) {
      return
    }
    const noBal = await universe.approvalsStore.queryBalance(
      pool.underlyingTokens[0],
      pool.address
    )
    if (noBal.isZero) {
      throw new Error(
        `No balance for ${pool.underlyingTokens[0]} in pool ${pool}`
      )
    }
    const p = await universe.fairPrice(noBal)
    if (p == null || p.asNumber() < 1000) {
      throw new Error('Pool is too small')
    }

    const burn = async (qty: TokenQuantity) => {
      try {
        const qtyin = qty.asNumber().toFixed(qty.token.decimals)

        const out = await (pool.meta.isMeta
          ? pool.meta.withdrawWrappedExpected(qtyin)
          : pool.meta.withdrawExpected(qtyin))

        return out.map((amount, i) =>
          (pool.meta.isMeta ? pool.underlyingTokens : pool.tokens)[i].from(
            parseFloat(amount)
          )
        )
      } catch (e) {
        throw e
      }
    }

    const mint = async (poolTokens: TokenQuantity[]) => {
      const out = await pool.meta.depositWrappedExpected(
        poolTokens.map((q) => q.asNumber())
      )
      return lpToken.from(out)
    }

    await universe.defineLPToken(lpToken, burn, mint)
  }

  const pools = await loadCurvePools(universe)
  const routerAddress = Address.from(curve.constants.ALIASES.router)

  const getPoolByLPMap = new Map<Token, CurvePool>()
  const curveGraph = new DefaultMap<
    Token,
    {
      edges: DefaultMap<Token, CurveSwap[]>
      pools: CurvePool[]
    }
  >(() => ({
    edges: new DefaultMap(() => []),
    pools: [],
  }))

  // const interestingTokens = new Set<Token>([
  //   ...universe.commonTokensInfo.tokens.values(),
  //   ...universe.rTokensInfo.tokens,
  //   universe.wrappedNativeToken,
  //   universe.nativeToken,
  // ])

  const poolsAdded = new Set<Address>()

  const routerCallInst = CurveRouterCall__factory.connect(
    universe.config.addresses.curveRouterCall.address,
    universe.provider
  )

  const allowedPoolTypes = [1, 2, 3, 10, 20, 30]

  await Promise.all(
    pools.map(async (pool) => {
      if (poolsAdded.has(pool.address)) {
        return
      }
      poolsAdded.add(pool.address)
      if (
        pool.meta.data.name.toLowerCase().includes('test') ||
        pool.meta.isLending ||
        pool.meta.isFake
      ) {
        return
      }
      try {
        let shouldAddToGraph = true
        // const poolTokens = [
        //   ...new Set([...pool.underlyingTokens, ...pool.tokens]),
        // ]
        // let shouldAddToGraph =
        //   poolTokens.every((t) => interestingTokens.has(t)) ||
        //   poolTokens.filter((t) => interestingTokens.has(t)).length >=
        //     poolTokens.length - 1

        // if (!shouldAddToGraph) {
        //   return
        // }
        try {
          if (allowedPoolTypes.includes(pool.poolType)) {
            await addLpToken(universe, pool)
            getPoolByLPMap.set(pool.lpToken, pool)
          }
        } catch (e) {
          console.log(pool.address.toString())
          // console.log(e)
          shouldAddToGraph = false
          return
        }

        for (let i = 0; i < pool.underlyingTokens.length; i++) {
          const token0 = pool.underlyingTokens[i]
          if (
            (typeof pool.meta.basePool?.length === 'number' &&
              pool.meta.basePool?.length > 0) ||
            pool.meta.isMeta ||
            pool.meta.isMetaFactory
          ) {
            if (i !== 0) {
              continue
            }
          }
          curveGraph.get(token0).pools.push(pool)

          for (let j = i + 1; j < pool.underlyingTokens.length; j++) {
            const token1 = pool.underlyingTokens[j]

            if (!shouldAddToGraph) {
              break
            }
            if (token0 === token1) {
              continue
            }
            const swap01 = wrapGasToken(
              universe,
              new CurveSwap(
                universe,
                pool,
                pool.getTokenIndex(token0),
                pool.getTokenIndex(token1),
                250_000n,
                routerInst,
                routerCallInst
              )
            )

            const swap10 = wrapGasToken(
              universe,
              new CurveSwap(
                universe,
                pool,
                pool.getTokenIndex(token1),
                pool.getTokenIndex(token0),
                250_000n,
                routerInst,
                routerCallInst
              )
            )

            curveGraph
              .get(swap01.inputToken[0])
              .edges.get(swap01.outputToken[0])
              .push(swap01)
            curveGraph
              .get(swap10.inputToken[0])
              .edges.get(swap10.outputToken[0])
              .push(swap10)

            universe.addAction(swap01)
            universe.addAction(swap10)
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
  )

  return {
    routerAddress,
    pools,
    getPoolByLPMap,
  }
}

export type CurveApi = Awaited<ReturnType<typeof loadCurve>>
