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
      pool.address,
      universe
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

  const interestingTokens = new Set<Token>([
    ...universe.commonTokensInfo.tokens.values(),
    ...universe.rTokensInfo.tokens,
    universe.wrappedNativeToken,
    universe.nativeToken,
  ])

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
        const poolTokens = [
          ...new Set([...pool.underlyingTokens, ...pool.tokens]),
        ]
        let shouldAddToGraph =
          poolTokens.every((t) => interestingTokens.has(t)) ||
          poolTokens.filter((t) => interestingTokens.has(t)).length >=
            poolTokens.length - 1

        if (!shouldAddToGraph) {
          return
        }
        try {
          if (
            allowedPoolTypes.includes(pool.poolType) &&
            poolTokens.every((t) => interestingTokens.has(t))
          ) {
            await addLpToken(universe, pool)
            getPoolByLPMap.set(pool.lpToken, pool)
          }
        } catch (e) {
          console.log(`Failed to add: ${pool}`)
          console.log(e)
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
