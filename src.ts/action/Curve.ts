import curve, { PoolTemplate, getPool } from '../curve-js/src'
import { curve as curveInner } from '../curve-js/src/curve'

import { ethers } from 'ethers'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { DefaultMap } from '../base/DefaultMap'
import { ChainId, ChainIds } from '../configuration/ReserveAddresses'
import { ICurveRouter, ICurveRouter__factory } from '../contracts'
import { Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class CurvePool {
  [Symbol.toStringTag] = 'CurvePool'

  public readonly addressesInUse = new Set<Address>()
  constructor(
    readonly address: Address,
    readonly lpToken: Token,
    readonly tokens: Token[],
    readonly underlyingTokens: Token[],
    public readonly meta: PoolTemplate,
    readonly templateName: string
  ) {
    this.addressesInUse.add(address)
  }

  get hasEth() {
    return this.underlyingTokens.some((t) => t.address === Address.ZERO)
  }

  public swapTypeUnderlying(i: number, j: number) {
    const tokenIn = this.underlyingTokens[i]
    const tokenOut = this.underlyingTokens[j]

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
    '0x1dFF955CdDD55fba58Db3CD658F9E3E3C31851eb',
    '0x595146ED98c81Dde9bD23d0c2Ab5b807C7Fe2D9f',
    '0x6525e7E2E8450741Ab97BD3948BFa47878F83ec6',
    '0x039FD59541b3989C7A1E9278431038B3B6BA5F43',
    '0xd3301B7CAA76f932816a6Fc7Ef0b673238e217ad',
    '0xB2E2536821521174a168eda7Be78a6c70ea6E5fA',
    '0x58257e4291F95165184b4beA7793a1d6F8e7b627',
    '0x21d158d95C2e150e144c36FC64E3653B8D6c6267',
    '0xBEc570d92AFB7fFc553bdD9d4B4638121000b10D',
    '0x4149d1038575CE235E03E03B39487a80FD709D31',
    '0x31c325A01861c7dBd331a9270296a31296D797A0',
    '0xd9f907f7F84CbB0Af85C7829922fd692339147f9',
    '0x75A1FdA374Fdb4E47d703d0282E94c87119fa46e',
    '0x13B876C26Ad6d21cb87AE459EaF6d7A1b788A113',
    '0x825722AF244432319C1E32b6b18AdED2d4A014Df',
    '0x02dFA5C793A9CE4d767a86259245A162a57f2dB4',
    '0xC7a87b0f491C1A043eb5315281163556B7F36f7f',
    '0x1631D0E588D475CEe4be0f51b7410DaaAaBD7034',
    '0x372463c1dFE3A9c269C2C5Eb76A86021C637D0f4',
    '0xb49B238aB6106216Dc26854ed3a009EAc1C419A9',
    '0xDcb11E81C8B8a1e06BF4b50d4F6f3bb31f7478C3',
    '0x6d91A9Cf0deA0cd5BCb676eb4B1F11b6DCb44188',
    '0x7f87a8b46A662131b87D29B2316B2d9CBD7e3B02',
    '0x52F05C70d86662204C7222C35000747b177C393a',
    '0xBE084cf7dB8fDfD6f17C041F958AbCcaF8C76603',
    '0x3e3C6c7db23cdDEF80B694679aaF1bCd9517D0Ae',
    '0x6a6283aB6e31C2AeC3fA08697A8F806b740660b2',
    '0xaeB6f2ABE64EE5ed210e8AE33B1F0f5E4B3e28Fc',
    '0x96f34Bb82fcA57e475e6ad218b0dd0C5c78DF423',
    '0x17374bdbcb79aE20CB947640915316d379a7f222',
    '0xf4E7c1E5a21F68df8d6a331aFFBEEBc313eD24d1',
    '0x3cc1b5DCe81A810080890FB8AdAd48F8eaa8c210',
    '0xFc1e8bf3E81383Ef07Be24c3FD146745719DE48D',
    '0x6575Ad173801f2d58961B3d7F3628c72346eA84a',
    '0xeE0dcAf26aA271Ff18bb9B9b282620A7Ce79F6BA',
    '0x867fe27FC2462cff8890B54DfD64E6d42a9D1aC8',
    '0xa246eD2954539f2eAa8e1FB72E02637f2a402AB7',
    '0x6868Eb3fcefe1684486F601d2dC10Bbf0C4EEB8b',
    '0x53DfCF5Ca1E1D5311Db29f585D56A9A9dcC2441b',
    '0x51Bcba35e5fa277592Cea83Ad14408A0963b86f8',
    '0x4CC9385d9909d2Bf529A4c1E847Dc4eE01F4927A',
    '0x675993fB30a2d58Cd4D29d15F89B4Be9ca8765AE',
    '0x6C5Acd4c044deFe22fEC287d1362B1aF5ED16f7a',
    '0x593807B540d2584Fd16433dc609F869421577173',
    '0x50e29cD32BEdf8ADF6C58cF0f8F2c64CB98C62ac',
    '0x7ce013171826FeB235Ed3fD4BA0171e64ac97D2b',
    '0x3D2253FA44C38d9870539dc2856286AA1638467f',
    '0xaBf03448f97708F06Fb1CaA5B58a30247f024D19',
    '0x56e9BaC9e21b9390b3344320b33f7AbE776eD35F',
    '0xf5Ed6024c08fca91F85A20aD364a4F3994f3ecae',
    '0xAF4264916B467e2c9C8aCF07Acc22b9EDdDaDF33',
    '0x7E650c700b0801e717B352E55a582AFd928aa094',
    '0x031af153eFbc75a88110CB3b94eafBEC847a526f',
    '0x53E4a076b62667E8C8Aae13b8edC793e9a5F3FeD',
    '0x0D8bc03C14a135783B135d51b256997dEf69175C',
    '0xBC41EFCacbd94241F2C89443E2832b31fbE6eb22',
    '0xe7a59B3b44AcacFD8A5Ba9259d6913f097946409',
    '0xce756104D10E1FDC60C9c32A84B1BB19712E52bA',
    '0xee3Dd0cb1A8175b69E1Cd6e354B9dC1629f3e8B5',
    '0x5f5Fe47fEd55eAe627386995198294C39e1d17a5',
    '0x5F2Bb3ded5De76644E2A033ACEDce6E93b4A3EfC',
    '0x713060278D13dfDBA6c7B58adebAf8B57213c904',
    '0xa7B0E924c2dBB9B4F576CCE96ac80657E42c3e42',
    '0xeD09ca8275dFfb09c632B6EA58C035a851F73616',
    '0xC8781F2193e2CB861c9325677D98297F94a0dfd3',
    '0x9f4A88da14F2b6DBc785C1Db3511A53B8F342bde',
    '0xf0C081020B9d06EB1b33e357767c00Ccc138bE7c',
    '0x679CE2A8B3180f5a00e0DCCA26783016799e9A58',
    '0x8083b047E962CA45B210E28aC755fbdA3D773c5B',
    '0x5b78b93Fa851c357586915c7bA7258b762eB1ba0',
    '0xd05ce4AB1f4fb0C0e1b65ebE3Ed7F2dcFc6ccf20',
    '0x97aEB34ac6561146DD9cE191EFD5634F6465DeF4',
    '0x9809f2B973bDB056D24bC2b6571EA1f23dB4e861',
    '0xeb07FcD7A8627281845ba3aCbed24435802d4B52',
    '0x6F80b9543Dd5A0408F162Fe2A1675dB70A2cb77D',
    '0xbf5D9DeCCCC762fA7B5eb9faC668c803D42D97b6',
    '0x9558b18f021FC3cBa1c9B777603829A42244818b',
    '0xee60f4A3487c07b4570cCfFEF315401C4c5744c8',
    '0x8116E7c29f60FdacF3954891A038f845565EF5A0',
    '0x2Ed1D3E7771D64feeD7AE8F25b4032c8dd2D0B99',
    '0x50C8F34CEA0E65535fC2525B637ccd8a07c90896',
    '0x642562115cf5A5e72Ab517E6448EC8b61843dac9',
    '0x48fcFFa86fb24bDEB45B5739F7Ced24095A7c8e8',
    '0xb3bC1833aC51aAcEA92acd551FBe1Ab7eDc59EdF',
    '0x85F102bE3a76165Be9668bE0bF36E906a488FD33',
    '0x87872BE0c56Ef97156f2617b3083D22423Fc62E9',
    '0x8b3138DF9aA1F60648C65C67D6Ff646BE305788B',
    '0xb548E49Bb6f33A77885836723b73EF9C8dBC047B',
    '0x3DcC3AC50cB42F7e443d7F548DD2c48EDaa8f59a',
    '0x172A54Ba45783049216F90F85FE5E5f6BC1c08fe',
    '0xF08dBD81Fcc712004e6943454c83C52DE963cdEC',
    '0x9fE520E629A7F0deC773A3199BFE87620E5aeA74',
    '0xb2111b55Edd1Cb5D2C18a6817e21D473FE0E5Ba1',
    '0xa23d59fA2505638861525f8cB3005fec7bd37b5B',
    '0xB90A850A0802B9F281bAbEA836292AAdd1011972',
    '0x9d0De74dE698D1BA7273D09193EC20a1F6cb7d6a',
    '0xEc4ACC9322FC4dc853e8f72631d2C95556C68Ec0',
    '0x3d675A52F5B572EB5c61FC5088203Ac9B16BFC70',
    '0x04f0Fae3dD0A9904F797DeB15C3e523342112811',
    '0x0B049eB31878176b278ef84A66810d311353dc94',
    '0x5239063A86e1E251eE6FB3AB4fb67DEA3A8E1fd2',
    '0x930792bd0fb4593063Ad2ee12E86d768bD8DF7a1',
    '0xb5FC990637F15bE6420341845a64101b6bbE365D',
    '0xabE43B60F8337818c21101AB78b5B216789e19DD',
    '0xDAB9EeEE607F7952680E9433787e4EdE244a8515',
    '0x62CEc7899A9910E48F0dEeaB755429887b6e1979',
    '0x00f93fBf00F97170B6cf295DC58888073CB5c2b8',
    '0x982Da76F0ccF868B558BD46D7a3B58bC2662D7cc',
    '0x578B27E257050B6011DfDCD69F67696eF24279FC',
    '0xB4698193bCBC49Be01Fcfc67C144eA4927166355',
    '0x188aBea43270791F96dC9209e239f7B79E61203B',
    '0x28B0Cf1baFB707F2c6826d10caf6DD901a6540C5',
    '0x8E27f0821873B6f5421b6ca75A4C5e1e83d3E77a',
    '0x6A0861625937cB3629066CC6Db88808a590B9C68',
    '0x498AD3352cCFAEd237A91f6933A92a7A43917B72',
    '0xd6B03059C882f63268dD3e1a98d8E3cDEe26919C',
    '0xa15e8f7E1e031e4F6f11053c6d320B2A8dc6742c',
    '0x6A52e339A4b8ABD15707f882D6ADC05875Ec5223',
    '0xa98794Accdb3996c7Ef015A354B6e1aDd2D2ce3e',
    '0xe82805a9b880E6DC520b6F017537F7781D55217F',
    '0xD511B5c309B2F7256FF7b3D41B029aFb96C7a331',
    '0xA77B5d170F3AEC2F72ca06490a7B9383A70ae5EB',
    '0x1400E08f1d9f5Bc90ae19ACd4bf81BEaBC9e79de',
    '0x9FD7e5B614FA071fF3543b44B68ef7699CEc4AF5',
    '0x166BDDEA59c13179796653B8afF13eeA1bd81a97',
    '0x613398AEcdAf6bCB6eDB8e61e5956794D23f7412',
    '0xA500Cd4E520682e1B1113e1055D55bAceAD61122',
    '0xFd46B54FcFF753bA058A5E9BbB45dCedc9A71FAb',
    '0x3C565D9151073e8E5002B61dc570f43A139cafe7',
    '0x84997FAFC913f1613F51Bb0E2b5854222900514B',
    '0xF52E248CcFBf189df0C5A4b15e9f72Fa10c7Fe59',
    '0xf275CADbE0343541ce49A03E385f8B234544CDa8',
    '0x08f9Dd845D0c91B918bB90cc5B124f3fd3e98f3A',
    '0x1CC1772C8899ad2A35aDe9B9978a56254cfc64a0',
    '0x968DeE60C67c184f9808510ec92D990e7E6616C2',
    '0xD8A114e127Aa5b9f20284FC7A1bDf2bC6853a28D',
    '0x83fc85F144bbeC4234E690B6451B105F3d7c60e4',
    '0x37F1D67A5Ac27B7C2D0F664E73cCBb82627Ac4a5',
    '0xcD0148e3f3350f4B98A48535f63A38fC630e80f1',
    '0x1F98249637bB42edB072DD2a8AdD44Aeb80dA218',
    '0x7B42d77bd2feE3c98baA58D559B83Ff3bB4702cf',
    '0x50122108f7b3B10ac219d066275087D37E4F4a61',
    '0x110cc323ca53d622469EdD217387E2E6B33F1dF5',
    '0xfFc78332F0dA6FbaabdAcFE8054CCbc501eED432',
    '0xC71Bc7e33510Aea215E4776867148fa25c368795',
    '0x0Bbe64Ea3cF57fDFdFD621F334B3469627A022aD',
    '0x02914596cad247C86e8F7d8464D1b3DBD0CeC86E',
    '0x48C6b29893ec0320e1cd10227B8C2F26EB342a83',
    '0xAb3435bd2959fD713F7e50389Ff374Bfee2E3B4b',
    '0x9A64DEc8DA8cE892fF711D715d9A8Fc82e966A44',
    '0xC3FE3EEdd7002842f2971183B5e87F89CC1ee848',
    '0xED43CB0DD25a1fA4dBD456F52c9fbB782F20EAE1',
    '0x8d6ed9bA971CF08441fc542AcECd35f691Afa752',
    '0x212a60171E22988492B7C38a1A3553c60F1892BE',
    '0x4029f7DcBdF6059ed80DA6856526E7510D64fA21',
    '0x386Ec09dB6f961b9e28B3dab174AD9567e57b90c',
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
    return 5n
  }

  routeParams() {
    const route: string[] = []
    const swapParams: number[][] = []

    type SwapParams = [number, number, number, number, number]
    let inputTokenAddr = this.inputToken[0].address.address
    let outputTokenAddr = this.outputToken[0].address.address
    route.push(inputTokenAddr, this.pool.address.address, outputTokenAddr)
    swapParams.push([
      this.inputTokenIndex,
      this.outputTokenIndex,
      this.pool.swapTypeUnderlying(this.inputTokenIndex, this.outputTokenIndex),
      this.pool.poolType,
      this.pool.underlyingTokens.length,
    ])

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
    const lib = this.gen.Contract.createContract(this.router)

    const { route, swapParams } = this.routeParams()
    let call = lib['exchange(address[11],uint256[5][5],uint256,uint256)'](
      route,
      swapParams,
      input,
      output.amount
    )
    if (this.inputToken[0] === this.universe.wrappedNativeToken) {
      call = call.withValue(input)
    }
    const outValue = planner.add(call)

    if (outValue == null) {
      throw new Error('Failed to get output value')
    }

    return [outValue]
  }

  get isTrade() {
    return true
  }

  get dependsOnRpc() {
    return true
  }

  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const { route, swapParams } = this.routeParams()
    try {
      const out = await this.router.callStatic[
        'get_dy(address[11],uint256[5][5],uint256)'
      ](route, swapParams, amountIn.amount)
      return [this.outputToken[0].from(out)]
    } catch (e) {
      // console.log('Failed with')
      // console.log(route)
      // console.log(swapParams)
      throw e
    }
  }

  public gasEstimate() {
    return this.gasEstimate_
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurvePool,
    public readonly inputTokenIndex: number,
    public readonly outputTokenIndex: number,
    private readonly gasEstimate_: bigint,
    private readonly router: ICurveRouter
  ) {
    super(
      pool.address,
      [
        pool.underlyingTokens[inputTokenIndex] === universe.nativeToken
          ? universe.wrappedNativeToken
          : pool.underlyingTokens[inputTokenIndex],
      ],
      [
        pool.underlyingTokens[outputTokenIndex] === universe.nativeToken
          ? universe.wrappedNativeToken
          : pool.underlyingTokens[outputTokenIndex],
      ],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          pool.underlyingTokens[inputTokenIndex],
          Address.from(curveInner.constants.ALIASES.registry_exchange)
        ),
      ]
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
          console.log(id)
          return null
        }
      })
      .filter((i) => i != null)

    const pools = poolsUnfiltered.filter(
      ({ pool }) =>
        pool.underlyingDecimals.every((i) => i !== 0) &&
        pool.wrappedDecimals.every((i) => i !== 0)
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
      pool.tokens[0],
      pool.address,
      universe
    )
    if (noBal.isZero) {
      throw new Error('Pool is too small')
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
  ])

  const poolsAdded = new Set<Address>()
  for (const pool of pools) {
    if (poolsAdded.has(pool.address)) {
      continue
    }
    poolsAdded.add(pool.address)
    if (
      pool.meta.data.name.toLowerCase().includes('test') ||
      pool.meta.isLending ||
      pool.meta.isFake
    ) {
      continue
    }
    try {
      const poolTokens = [
        ...new Set([...pool.underlyingTokens, ...pool.tokens]),
      ]
      let shouldAddToGraph =
        poolTokens.filter((t) => interestingTokens.has(t)).length > 1

      if (!shouldAddToGraph) {
        continue
      }
      try {
        if (
          pool.poolType < 10 &&
          poolTokens.every((t) => interestingTokens.has(t))
        ) {
          await addLpToken(universe, pool)
          getPoolByLPMap.set(pool.lpToken, pool)
        }
      } catch (e) {
        console.log(`Failed to add: ${pool}`)
        shouldAddToGraph = false
        continue
      }

      for (const token0 of pool.underlyingTokens) {
        curveGraph.get(token0).pools.push(pool)

        for (const token1 of pool.underlyingTokens) {
          if (!shouldAddToGraph) {
            break
          }
          if (token0 === token1) {
            continue
          }
          const swap01 = new CurveSwap(
            universe,
            pool,
            pool.getTokenIndex(token0),
            pool.getTokenIndex(token1),
            500000n,
            routerInst
          )

          const swap10 = new CurveSwap(
            universe,
            pool,
            pool.getTokenIndex(token1),
            pool.getTokenIndex(token0),
            250000n,
            routerInst
          )

          curveGraph.get(token0).edges.get(token1).push(swap01)
          curveGraph.get(token1).edges.get(token0).push(swap10)

          universe.addAction(swap01)
          universe.addAction(swap10)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  console.log('Curve loaded!!')

  return {
    routerAddress,
    pools,
    getPoolByLPMap,
  }
}

export type CurveApi = Awaited<ReturnType<typeof loadCurve>>
