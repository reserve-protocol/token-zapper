import { defaultAbiCoder } from '@ethersproject/abi/lib/abi-coder'
import { BigNumber, constants, providers } from 'ethers'
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper'

// import {
//   type ForkySimulator,
//   type OnLogFn,
//   type SimulatorFork,
// } from '@slot0/forky'

import { simulationUrls } from '../base/constants'
// import abi from '../../contracts/artifacts/contracts/Zapper.sol/ZapperExecutor.json'
// const byteCode = abi.deployedBytecode
import { Config } from '../configuration/ChainConfiguration'
import { logger } from '../logger'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import {
  IERC20__factory,
  IRToken__factory,
  IWrappedERC20__factory,
  IWrappedNative__factory,
} from '../contracts'
import { Token } from '../entities/Token'
export interface SimulateParams {
  transactions: {
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
  }[]
  setup?: {
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
  params: SimulateParams,
  universe: Universe
) => Promise<string[]>

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
export const createSimulateZapTransactionUsingProvider = (
  provider: providers.JsonRpcProvider
): SimulateZapTransactionFunction => {
  console.warn(
    `USING DEFAULT SIMULATION FUNCTION - USERS MUST HAVE FUNDS AND APPROVALS SETUP CORRECTLY FOR CORRECT PREDICTIONS TO WORK`
  )
  console.warn(
    `WILL NOT BE ABLE TO INFER FEE ON SALE/BUY TOKENS CORRECTLY, UNISWAPV2 ROUTING WILL BE DEGRADED`
  )
  return async (p: SimulateParams): Promise<string[]> => {
    const input = p.transactions.at(-1)!
    const data = await provider.call({
      to: input.to,
      from: input.from,
      data: input.data,
      value: input.value,
    })
    return [data]
  }
}

const ETH_256 = '0x56bc75e2d6310000000'
type AddressLike = string | Address | Token
const getAddrStr = (addr: AddressLike) => {
  if (typeof addr === 'string') {
    return addr
  }
  if (addr instanceof Address) {
    return addr.address
  }
  return addr.address.address
}
const rTokenInterface = IRToken__factory.createInterface()
const erc20Interface = IERC20__factory.createInterface()
const wethInterface = IWrappedNative__factory.createInterface()

const bigintToHexStr = (n: bigint) => {
  let str = n.toString(16)
  if (str.length % 2 !== 0) {
    str = '0' + str
  }
  return '0x' + str
}

export const makeCallManySimulator = (
  rpcNode: string,
  whales: Record<string, string>
): SimulateZapTransactionFunction => {
  whales = Object.fromEntries(
    Object.entries(whales).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()])
  )

  return async (input: SimulateParams, universe: Universe) => {
    const stateOverride: any = {}
    const transactions: any[] = []

    const setETHBalance = (address: AddressLike, balance?: bigint) => {
      stateOverride[getAddrStr(address)] = {
        balance: balance != null ? bigintToHexStr(balance) : ETH_256,
      }
    }

    const addTransaction = (
      from: AddressLike,
      to: AddressLike,
      data: string,
      value: bigint = 0n,
      gas: bigint = 15_000_000n
    ) => {
      transactions.push({
        from: getAddrStr(from),
        to: getAddrStr(to),
        data,
        gas: bigintToHexStr(gas),
        value: bigintToHexStr(value),
      })
    }

    const addApproval = (
      token: AddressLike,
      owner: AddressLike,
      spender: AddressLike,
      value: bigint = constants.MaxUint256.toBigInt()
    ) => {
      addTransaction(
        owner,
        token,
        erc20Interface.encodeFunctionData('approve', [
          getAddrStr(spender),
          bigintToHexStr(value),
        ])
      )
    }
    if (input.setup != null) {
      const token = await universe.getToken(
        Address.from(input.setup.inputTokenAddress.toLowerCase())
      )
      if (token === universe.nativeToken) {
        setETHBalance(
          input.setup.inputTokenAddress,
          input.setup.userBalanceAndApprovalRequirements +
            0x56bc75e2d6310000000n
        )
      } else {
        addApproval(
          token,
          input.setup.inputTokenAddress,
          input.setup.inputTokenAddress,
          input.setup.userBalanceAndApprovalRequirements
        )
      }

      if (token === universe.wrappedNativeToken) {
        setETHBalance(
          input.setup.inputTokenAddress,
          input.setup.userBalanceAndApprovalRequirements +
            0x56bc75e2d6310000000n
        )
        addTransaction(
          input.setup.inputTokenAddress,
          token,
          wethInterface.encodeFunctionData('deposit'),
          input.setup.userBalanceAndApprovalRequirements,
          15_000_000n
        )
      } else {
        const whale = whales[input.setup.inputTokenAddress.toLowerCase()]

        if (whale) {
          stateOverride[whale] = {
            balance: ETH_256,
          }
        }

        if (whale == null) {
          universe.logger.warn(
            'No whale for token ' +
              input.setup.inputTokenAddress +
              ', so will not fund the sender with funds'
          )
        } else {
          addTransaction(
            whale,
            input.setup.inputTokenAddress,
            erc20Interface.encodeFunctionData('transfer', [
              input.setup.inputTokenAddress,
              input.setup.userBalanceAndApprovalRequirements,
            ])
          )
        }
      }
    }
    for (const tx of input.transactions) {
      setETHBalance(tx.from)
      addTransaction(tx.from, tx.to, tx.data, tx.value, 20_000_000n)
    }

    const body = {
      jsonrpc: '2.0',
      method: 'eth_callMany',
      id: 1,
      params: [
        {
          transactions,
        },
        {
          blockNumber: bigintToHexStr(BigInt(universe.currentBlock)),
          transactionIndex: 1,
        },
        stateOverride,
      ],
    }

    const encodedBody = JSON.stringify(body, null, 2)
    const resp = await fetch(rpcNode, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: encodedBody,
    })
    if (resp.status !== 200) {
      throw new Error(`Failed to simulate zap, status ${resp.status}`)
    }
    const results: {
      id: number
      jsonrpc: string
      result: {
        value: string
        error?: any
      }[]
    } = await resp.json()
    const resultOfZap = results.result[results.result.length - 1]
    if (resultOfZap.error) {
      throw new Error(resultOfZap.error)
    }

    return results.result.map((i) => i.value)
  }
}

export const makeCustomRouterSimulator = (
  url: string,
  whales: Record<string, string>,
  addreses?: Config['addresses']
): SimulateZapTransactionFunction => {
  whales = Object.fromEntries(
    Object.entries(whales).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()])
  )

  return async (
    input: SimulateParams,
    universe: Universe
  ): Promise<string[]> => {
    const moveFunds: any[] = []
    const stateOverride: any = {}
    const transactions: any[] = []

    const addBalance = (address: AddressLike, balance?: bigint) => {
      stateOverride[getAddrStr(address)] = {
        balance: balance != null ? bigintToHexStr(balance) : ETH_256,
      }
    }

    const addTransaction = (
      from: AddressLike,
      to: AddressLike,
      data: string,
      gas: bigint = 15_000_000n,
      value: bigint = 0n
    ) => {
      transactions.push({
        from: getAddrStr(from),
        to: getAddrStr(to),
        data,
        gas: bigintToHexStr(gas),
        value: bigintToHexStr(value),
      })
    }

    const approvals: any[] = []

    const addApproval = (
      token: AddressLike,
      owner: AddressLike,
      spender: AddressLike,
      value: bigint = constants.MaxUint256.toBigInt()
    ) => {
      approvals.push({
        owner: getAddrStr(owner),
        token: getAddrStr(token),
        spender: getAddrStr(spender),
        value: bigintToHexStr(value),
      })
    }

    if (input.setup != null) {
      const token = await universe.getToken(
        Address.from(input.setup.inputTokenAddress.toLowerCase())
      )
      addBalance(input.setup.inputTokenAddress)

      if (token === universe.nativeToken) {
        addBalance(
          input.setup.inputTokenAddress,
          input.setup.userBalanceAndApprovalRequirements +
            0x56bc75e2d6310000000n
        )
      } else {
        addApproval(
          token,
          input.setup.inputTokenAddress,
          input.setup.inputTokenAddress,
          input.setup.userBalanceAndApprovalRequirements
        )
      }

      if (token === universe.wrappedNativeToken) {
        addBalance(
          input.setup.inputTokenAddress,
          input.setup.userBalanceAndApprovalRequirements +
            0x56bc75e2d6310000000n
        )
        addTransaction(
          input.setup.inputTokenAddress,
          token,
          wethInterface.encodeFunctionData('deposit'),
          15_000_000n,
          input.setup.userBalanceAndApprovalRequirements
        )
      } else if (
        universe.rTokensInfo.tokens.has(token) &&
        whales[token.address.address.toLowerCase()] == null
      ) {
        const rTokenDeployment = universe.getRTokenDeployment(token)
        addBalance(rTokenDeployment.backingManager)

        const extra = input.setup.userBalanceAndApprovalRequirements / 10n
        const mintQty = input.setup.userBalanceAndApprovalRequirements + extra

        addTransaction(
          rTokenDeployment.backingManager,
          token,
          rTokenInterface.encodeFunctionData('mint', [mintQty])
        )
        addTransaction(
          rTokenDeployment.backingManager,
          token,
          rTokenInterface.encodeFunctionData('setBasketsNeeded', [
            (
              await rTokenDeployment.contracts.rToken.callStatic.basketsNeeded()
            ).toBigInt() - mintQty,
          ])
        )
        addTransaction(
          rTokenDeployment.backingManager,
          token,
          erc20Interface.encodeFunctionData('transfer', [
            input.setup.inputTokenAddress,
            input.setup.userBalanceAndApprovalRequirements,
          ])
        )
      } else {
        const whale = whales[input.setup.inputTokenAddress.toLowerCase()]

        if (whale) {
          stateOverride[whale] = {
            balance: ETH_256,
          }
        }

        if (whale == null) {
          universe.logger.warn(
            'No whale for token ' +
              input.setup.inputTokenAddress +
              ', so will not fund the sender with funds'
          )
        }
        moveFunds.push({
          owner: whale,
          token: input.setup.inputTokenAddress,
          spender: input.setup.inputTokenAddress,
          quantity:
            '0x' + input.setup.userBalanceAndApprovalRequirements.toString(16),
        })
      }
    }
    for (const tx of input.transactions) {
      addTransaction(tx.from, tx.to, tx.data, 20_000_000n, tx.value)
    }

    const body = {
      setupApprovals: approvals,
      moveFunds: moveFunds,
      transactions: transactions,
      stateOverride: stateOverride,
    }

    // if (addreses) {
    //   body.stateOverride[addreses.executorAddress.address] = {
    //     code: byteCode,
    //   }
    // }

    const encodedBody = JSON.stringify(body, null, 2)
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: encodedBody,
    })
    if (resp.status !== 200) {
      throw new Error(`Failed to simulate zap, status ${resp.status}`)
    }
    const results = await resp.json()
    const resultOfZap = results[results.length - 1]
    if (resultOfZap.error) {
      if (resultOfZap.error.value != null) {
        return [resultOfZap.error.value]
      }
      throw new Error(resultOfZap.error.error)
    }

    // const transferLogs = resultOfZap.success.logs.filter(
    //   (i: any) =>
    //     i.topics[0] ===
    //     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    // )

    // for (const log of transferLogs) {
    //   const addr = Address.from(log.address)
    //   const token = await universe.getToken(addr)
    //   const qty = token.from(BigInt(log.data))
    //   const from = Address.from(log.topics[1].slice(26))
    //   const to = Address.from(log.topics[2].slice(26))
    //   console.log(`${from} -> ${to} ${qty}`)
    // }

    const out = results.map(
      (i: any) => i?.success?.value ?? i?.error?.error ?? '0x'
    )
    return out
  }
}

export type ILoggerType = typeof logger
