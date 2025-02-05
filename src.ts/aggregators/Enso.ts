import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { Token, TokenQuantity } from '../entities/Token'

import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { EnsoRouter__factory } from '../contracts/factories/contracts/EnsoRouter__factory'
import { SwapPlan } from '../searcher/Swap'
import { FunctionCall, Planner, Value } from '../tx-gen/Planner'
import { DexRouter, TradingVenue } from './DexAggregator'

export interface EnsoQuote {
  gas: string
  amountOut: string
  createdAt: number
  tx: {
    data: string
    to: string
    from: string
    value: string
  }
  route: {
    action: string
    protocol: string
    tokenIn: [string]
    tokenOut: [string]
    positionInId: [string]
    positionOutId: [string]
  }[]
}

const ENSO_GAS_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const encodeToken = (universe: Universe, token: Token) => {
  if (token === universe.nativeToken) {
    return ENSO_GAS_TOKEN
  }
  return token.address.address.toLowerCase()
}

const getEnsoQuote_ = async (
  abort: AbortSignal,
  universe: Universe,
  quantityIn: TokenQuantity,
  tokenOut: Token,
  recipient: Address,
  slippage: bigint,
  uni: Universe
) => {
  const execAddr: string = recipient.address.toLowerCase()
  const inputTokenStr: string = encodeToken(universe, quantityIn.token)
  const outputTokenStr: string = encodeToken(universe, tokenOut)

  const GET_QUOTE_DATA = `${API_ROOT}?chainId=${universe.chainId}&slippage=1&fromAddress=${execAddr}&routingStrategy=router&priceImpact=false&spender=${execAddr}`
  const reqUrl = `${GET_QUOTE_DATA}&receiver=${execAddr}&amountIn=${quantityIn.amount.toString()}&tokenIn=${inputTokenStr}&tokenOut=${outputTokenStr}&disableRFQs=false`

  // console.log(reqUrl)
  const quote: EnsoQuote = await (
    await fetch(reqUrl, {
      method: 'GET',
      signal: abort,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json()
  // console.log(reqUrl)

  if (quote.tx?.data == null) {
    // console.log(reqUrl)
    throw new Error((quote as any).message)
  }

  try {
    let pos = 10
    const read = (len = 64) => {
      let out = quote.tx.data.slice(pos, pos + len)
      pos += len
      if (out.length < len) {
        out = out.padEnd(len, '0')
      }
      return out
    }
    const tokenIn = '0x' + read()
    const amtIn = '0x' + read()
    // Skip over offset
    pos += 128
    const cmdsLenNum = Number(BigInt('0x' + read()))
    const cmds: string[] = []
    for (let i = 0; i < cmdsLenNum; i++) {
      cmds.push('0x' + read())
    }
    const stateLenNum = Number(BigInt('0x' + read()))
    const stateOffsets: number[] = []
    const curPos = pos
    for (let i = 0; i < stateLenNum; i++) {
      const offset = Number(BigInt('0x' + read())) * 2
      stateOffsets.push(curPos + offset)
    }
    const state: string[] = []
    for (let i = 0; i < stateLenNum; i++) {
      const offset = stateOffsets[i]
      pos = offset
      const size = Number(BigInt('0x' + read()))
      state.push('0x' + read(size * 2))
    }

    const cmdsToCheck: string[] = cmds
    for (let i = 0; i < state.length; i++) {
      const val = state[i]
      if (val.length > 320) {
        try {
          const decoded = defaultAbiCoder.decode(
            [ParamType.from('bytes32[]')],
            val
          )[0] as string[]
          cmdsToCheck.push(...decoded)
        } catch (e) {}
      }
    }

    const addresesInUse = new Set(
      cmdsToCheck
        .map((i) => Address.from('0x' + i.slice(26)))
        .filter((i) => {
          const tok = uni.tokens.get(i)
          return !tok || universe.lpTokens.has(tok)
        })
    )

    // console.log(cmds);
    // console.log(state);

    const parsed = {
      ...quote,
      addresesInUse,
      tx: {
        ...quote.tx,
        data: {
          amountIn: amtIn,
          tokenIn,
          commands: cmds,
          state,
        },
      },
      quantityIn,
      quantityOut: tokenOut.from(BigInt(quote.amountOut)),
      tokenIn: inputTokenStr,
      tokenOut: outputTokenStr,
    }

    return parsed
  } catch (e) {
    throw e
  }
}
const getEnsoQuote = async (
  abort: AbortSignal,
  universe: Universe,
  quantityIn: TokenQuantity,
  tokenOut: Token,
  recipient: Address,
  slippage: bigint,
  retries = 2
) => {
  return await getEnsoQuote_(
    abort,
    universe,
    quantityIn,
    tokenOut,
    recipient,
    slippage,
    universe
  )
}
type ParsedQuote = Awaited<ReturnType<typeof getEnsoQuote>>

class EnsoAction extends Action('Enso') {
  public get oneUsePrZap() {
    return true
  }
  public get returnsOutput() {
    return false
  }
  public get supportsDynamicInput() {
    return true
  }
  public get addressesInUse() {
    return this.request.addresesInUse
  }
  get outputSlippage() {
    return 30n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [predicted]: TokenQuantity[]
  ) {
    const ensoLib = this.gen.Contract.createContract(
      EnsoRouter__factory.connect(this.request.tx.to, this.universe.provider)
    )
    let routeSingleCall: FunctionCall = ensoLib.routeSingle(
      this.request.tokenIn,
      input ?? predicted.amount,
      this.request.tx.data.commands,
      this.request.tx.data.state
    )
    planner.add(
      routeSingleCall,
      `EnsoRouter.routeSingle(${this.request.quantityIn} -> ${this.request.quantityOut})`
    )
    return null
  }
  public outputQuantity: TokenQuantity[] = []
  constructor(
    public readonly universe: Universe,
    inputQty: TokenQuantity,
    outputQty: TokenQuantity,
    private request: ParsedQuote,
    public readonly slippage: bigint
  ) {
    super(
      Address.from(request.tx.to),
      [inputQty.token],
      [outputQty.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(inputQty.token, Address.from(request.tx.to))]
    )
  }
  get inputQty() {
    return this.request.quantityIn
  }
  get outputQty() {
    return this.request.quantityOut
  }
  toString() {
    return `Enso(${this.inputQty} => ${this.outputQty})`
  }

  async quote([_]: TokenQuantity[]): Promise<TokenQuantity[]> {
    // if (
    //   Math.abs(this.lastQuoteBlock - this.universe.currentBlock) >
    //   this.universe.config.requoteTolerance
    // ) {
    //   try {
    //     this.request = await getEnsoQuote(
    //       AbortSignal.timeout(2000),
    //       this.universe,
    //       input,
    //       this.outputQty.token,
    //       this.address,
    //       this.slippage,
    //       1
    //     )
    //   } catch (e) {}
    // }
    return [this.outputQty]
  }

  gasEstimate(): bigint {
    return BigInt(this.request.gas)
  }
}

const API_ROOT =
  'https://worker-purple-frost-55b5.mig2151.workers.dev/api/v1/shortcuts/route'
export const createEnso = (
  aggregatorName: string,
  universe: Universe,
  retries = 2
) => {
  const dex = new DexRouter(
    universe,
    aggregatorName,
    async (abort: AbortSignal, input, output, slippage) => {
      if (
        input.token === universe.nativeToken ||
        output === universe.nativeToken
      ) {
        throw new Error('Unsupported')
      }
      const control = new AbortController()

      abort.addEventListener('abort', () => {
        if (control.signal.aborted) return
        control.abort()
      })
      setTimeout(() => {
        if (control.signal.aborted) return
        control.abort()
      }, universe.config.routerDeadline)

      const req = await getEnsoQuote(
        control.signal,
        universe,
        input,
        output,
        universe.execAddress,
        slippage,
        retries
      )
      return await new SwapPlan(universe, [
        new EnsoAction(
          universe,
          input,
          output.from(BigInt(req.amountOut)),
          req,
          slippage
        ),
      ]).quote([input])
    },
    true
  ).withMaxConcurrency(4)

  return new TradingVenue(universe, dex)
}
