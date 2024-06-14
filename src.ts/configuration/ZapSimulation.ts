import { defaultAbiCoder } from '@ethersproject/abi/lib/abi-coder'
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper'
import { BigNumber, constants, providers } from 'ethers'
import { simulationUrls } from '../base/constants'

export interface SimulateParams {
  // Zapper address on the chain
  to: string

  // Usually the signer address
  from: string

  // The encoded full zap transaction to the zapper
  data: string

  // If doing a zapETH, this is the value to send
  value: bigint

  // The setup contains what the user needs in order to use the zapper successfully for
  // generated zap transaction. If zapping non-eth, the simulator needs to ensure that an
  // approval is setup for the zapper contract to spend the token the '.to' field above
  setup: {
    // The quantity of the tokens the user wants to zap
    userBalanceAndApprovalRequirements: bigint

    // The ERC20 token address, or 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for ETH
    inputTokenAddress: string
  }
}

// For convinience, here is the output type, and a decode function
export type SimulateZapOutput = Pick<
  ZapperOutputStructOutput,
  'dust' | 'amountOut' | 'gasUsed'
>
export const decodeSimulationFunctionOutput = (data: string) => {
  const [[dust, amountOut, gasUsed]] = defaultAbiCoder.decode(
    ['(uint256[],uint256,uint256)'],
    data
  ) as [[BigNumber[], BigNumber, BigNumber]]
  const out: SimulateZapOutput = {
    dust,
    amountOut: amountOut,
    gasUsed: gasUsed,
  }
  return out
}

export type SimulateZapTransactionFunction = (
  params: SimulateParams
) => Promise<string>

/**
 *
 * @param provider an ethers provider
 * @param input The input of the zap transaction & setup
 * @returns The output of the zap transaction, assuming that the from user has
 *         the required balance and approval setup beforehand. This is only meant as a
 *         solution for example purposes. For UIs this would not be a good solution
 *         as it requires the user to have the correct balance and approval setup beforehand
 *         to correctly preview the result.
 * @note It will obviously revert if approvals or balances are not setup correctly
 */
export const createSimulateZapTransactionUsingProvider =
  (provider: providers.JsonRpcProvider): SimulateZapTransactionFunction =>
  async (input: SimulateParams): Promise<string> => {
    const data = await provider.call({
      to: input.to,
      from: input.from,
      data: input.data,
      value: input.value,
    })
    return data
  }

// Default implementation of the simulation function, using the provider
// It works well for zaps that zaps using ETH as the input
export const simulateZapTransactionUsingProviderDecodeResult = async (
  provider: providers.JsonRpcProvider,
  input: SimulateParams
): Promise<SimulateZapOutput> => {
  const data = await provider.send('eth_call', [
    {
      to: input.to,
      from: input.from,
      data: input.data,
      value: input.value,
    },
    'latest',
    {
      [input.from]: {
        balance: '0x56bc75e2d6310000000',
      },
    },
  ])
  return decodeSimulationFunctionOutput(data)
}

export const createSimulatorThatUsesOneOfReservesCallManyProxies = (
  chainId: number
): SimulateZapTransactionFunction => {
  const url = simulationUrls[chainId]
  if (url == null) {
    throw new Error('No proxies for this chain yet')
  }

  return async (input: SimulateParams) => {
    const body = JSON.stringify({
      from: input.from,
      to: input.to,
      data: input.data,
      gasLimit: 10_000_000,
      value: '0x' + input.value.toString(16),

      quantity:
        '0x' + input.setup.userBalanceAndApprovalRequirements.toString(16),
      token: input.setup.inputTokenAddress,

      overrides: {},
    })

    const a: { data: string; error?: string } = await (
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })
    ).json()
    if (a.error != null) {
      throw new Error(a.error)
    }
    return a.data
  }
}

export const makeCustomRouterSimulator = (
  url: string,
  whales: Record<string, string>
): SimulateZapTransactionFunction => {
  whales = Object.fromEntries(
    Object.entries(whales).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()])
  )

  return async (input: SimulateParams) => {
    const whale = whales[input.setup.inputTokenAddress.toLowerCase()]

    if (whale == null) {
      console.log(
        'No whale for token ' +
          input.setup.inputTokenAddress +
          ', so will not fund the sender with funds'
      )
    }

    const body = {
      setupApprovals: [
        {
          owner: input.from,
          token: input.setup.inputTokenAddress,
          spender: input.to,
          value: '0x' + constants.MaxUint256.toBigInt().toString(16),
        },
      ],
      moveFunds:
        whale != null
          ? [
              {
                owner: whale,
                token: input.setup.inputTokenAddress,
                spender: input.from,
                quantity:
                  '0x' +
                  input.setup.userBalanceAndApprovalRequirements.toString(16),
              },
            ]
          : [],
      transactions: [
        {
          from: input.from,
          to: input.to,
          data: input.data,
          gas: '0x' + (25_000_000).toString(16),
          gasPrice: '0x1',
          value: '0x' + input.value.toString(16),
        },
      ],
      stateOverride: {
        [input.from]: {
          balance: '0x56bc75e2d6310000000',
        },
        [whale]: {
          balance: '0x56bc75e2d6310000000',
        },
      },
    }

    const encodedBody = JSON.stringify(body, null, 2)

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: encodedBody,
    })
    const results = await resp.json()
    const resultOfZap = results[results.length - 1]
    if (resultOfZap.error) {
      if (resultOfZap.error.value != null) {
        return resultOfZap.error.value
      }
      throw new Error(resultOfZap.error.error)
    }
    return resultOfZap.success.value
  }
}
