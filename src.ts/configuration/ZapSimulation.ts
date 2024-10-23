import { defaultAbiCoder } from '@ethersproject/abi/lib/abi-coder'
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper'
import { BigNumber, constants, providers } from 'ethers'

import * as ethers from 'ethers'
import { Interface } from 'ethers/lib/utils'

import { hexlify } from 'ethers/lib/utils'
import {
  AccessList,
  type ForkySimulator,
  type OnLogFn,
  type SimulatorFork,
} from '@slot0/forky'

import { simulationUrls } from '../base/constants'
// import abi from '../../contracts/artifacts/contracts/Zapper.sol/ZapperExecutor.json'
// const byteCode = abi.deployedBytecode
import { Config } from '../configuration/ChainConfiguration'
import { JsonRpcProvider, TransactionRequest } from '@ethersproject/providers'
import { Universe } from '../Universe'
import { logger } from '../logger'
import { wait } from '../base/controlflow'
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

  addresesToPreload?: string[]
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
  whales: Record<string, string>,
  addreses?: Config['addresses']
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
        } as Partial<{ balance: string; code: string }>,
      },
    }
    // if (addreses) {
    //   body.stateOverride[addreses.executorAddress.address] = {
    //     code: byteCode,
    //   }
    // }

    if (whale) {
      body.stateOverride[whale] = {
        balance: '0x56bc75e2d6310000000',
      }
    }

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
        return resultOfZap.error.value
      }
      throw new Error(resultOfZap.error.error)
    }
    return resultOfZap.success.value
  }
}

export type ILoggerType = typeof logger

const erc20Interface = new Interface([
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
])
const ONE_ETH = 10n ** 18n
export const preloadSimulator = async (
  universe: Universe,
  simulator: ForkySimulator
) => {
  const preloadedAddresses = [
    ...new Set([
      ...[...universe.rTokensInfo.addresses],
      ...[...universe.commonTokensInfo.addresses],
      ...[...universe.actions.keys()],
      universe.config.addresses.curveCryptoFactoryHelper,
      universe.config.addresses.curveRouterCall,
      universe.config.addresses.facadeAddress,
      universe.config.addresses.balanceOf,
      universe.config.addresses.emitId,
      universe.config.addresses.uniV3Router,
      universe.config.addresses.rtokenLens,
      universe.config.addresses.curveStableSwapNGHelper,
      universe.execAddress,
      universe.zapperAddress,
    ]),
  ].map((i) => i.address)
  universe.searcher.debugLog(
    `Preloading ${preloadedAddresses.length} addresses`
  )
  await simulator.preload(preloadedAddresses)

  return preloadedAddresses
}

const defaultLogger: ILoggerType = {
  log: (...args: any[]) => { },
  info: (...args: any[]) => { },
  debug: (...args: any[]) => { },
  error: (...args: any[]) => console.log(args.join(' ')),
  warn: (...args: any[]) => { },
}

let lastSubmission = 0
export const makeFromForky = (
  simulator: ForkySimulator,
  whales: Record<string, string> = {},
  logger: ILoggerType = defaultLogger
) => {
  whales = Object.fromEntries(
    Object.entries(whales).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()])
  )

  const getERC20Balance = async (
    fork: SimulatorFork,
    token: string,
    owner: string
  ) => {
    const data = erc20Interface.encodeFunctionData('balanceOf', [owner])
    const res = await fork.commitTx(
      {
        to: token,
        from: owner,
        data,
        value: 0n,
      },
      () => { }
    )

    if (res.receipt.status != 1) {
      logger.error(`(owner=${owner}) ${token}.balanceOf(${owner}) failed`)
      return null
    }
    const balance = BigInt(res.execResult.returnValue)
    logger.debug(`(owner=${owner}) ${token}.balanceOf(${owner}) => ${balance}`)
    return {
      balance: balance,
      accessList: res.accessList,
    }
  }

  const setERC20BalanceUsingStorage = async (
    fork: SimulatorFork,
    input: SimulateParams
  ) => {
    const bal = await getERC20Balance(
      fork,
      input.setup.inputTokenAddress,
      input.from
    )
    const inputToken = input.setup.inputTokenAddress.toLowerCase()

    if (bal == null) {
      logger.error(`Failed to simulate ${inputToken}.balanceOf(${input.from})`)
      return false
    }
    const { balance, accessList } = bal
    const currentValue = BigInt(bal.balance)
    if (currentValue > input.setup.userBalanceAndApprovalRequirements) {
      logger.debug(
        `Will not set balance of ${input.from} for ${inputToken}: Current balance ${currentValue} is greater than expected ${input.setup.userBalanceAndApprovalRequirements}`
      )
      return false
    }

    logger.debug(`Result of simulating ${inputToken}.balanceOf(${input.from})`)
    logger.debug(`Balance: ${currentValue}`)
    logger.debug(`AccessList: ${accessList}`)
    const readSlotFind = accessList.find(([contract]) => {
      return contract.toLowerCase() === inputToken
    })
    let reads = (readSlotFind != null ? readSlotFind[1] ?? [] : [])
      .map((i) => BigInt(i))
      .filter((i) => i < 100000n)

    if (reads.length > 1) {
      logger.debug(
        `Found ${reads.length
        } candidate storage slots for ${inputToken}: ${reads.join(
          ', '
        )}. Trying to narrow it down to ${currentValue}`
      )

      const values = await Promise.all(
        reads.map(async (index) => {
          return [index, await fork.getStorageAt(inputToken, index)] as const
        })
      )
      const exact = values.filter(([_, value]) => value === currentValue)
      reads = exact.length !== 0 ? exact.map(([index, _]) => index) : reads
    }
    if (reads.length === 0) {
      logger.error(
        `Failed to set balance of ${input.from} for ${inputToken}: No slot found`
      )
      return null
    }
    for (const readSlot of reads) {
      const id = await fork.checkpoint()
      await fork.setContractStorage(
        inputToken,
        BigInt(readSlot),
        input.setup.userBalanceAndApprovalRequirements
      )
      const newBalance = (await getERC20Balance(fork, inputToken, input.from))
        ?.balance
      if (newBalance != null) {
        if (
          newBalance !== balance ||
          newBalance === input.setup.userBalanceAndApprovalRequirements
        ) {
          logger.debug(
            `Updated balance of ${input.from} using ${readSlot}: Balance changed from ${currentValue} to ${newBalance}`
          )
          if (newBalance < input.setup.userBalanceAndApprovalRequirements) {
            logger.error(
              `Failed to edit balance of ${input.from} for ${inputToken}: Expected ${input.setup.userBalanceAndApprovalRequirements} but got ${newBalance}`
            )
          }
          return BigInt(readSlot)
        }
        if (newBalance === currentValue) {
          logger.debug(
            `fork.revertTo: Editing slot ${readSlot} did not change balance, reverting change just in case`
          )
        }
      } else {
        logger.debug(
          `fork.revertTo: Editing slot ${readSlot} caused, balanceOf(${input.from}) to revert`
        )
      }
      await fork.revertTo(id)
    }
    logger.debug(
      `Failed to set balance of ${input.from} for ${inputToken}: No slot found`
    )
    return null
  }

  const moveFundsUsingERC20Abi = async (
    fork: SimulatorFork,
    input: SimulateParams,
    whale: string
  ) => {
    const inputToken = input.setup.inputTokenAddress.toLowerCase()
    const bal = await getERC20Balance(fork, inputToken, input.from)
    if (bal == null) {
      logger.error(`Failed to get balance of ${input.from} for ${inputToken}`)
      return
    }

    if (bal.balance > input.setup.userBalanceAndApprovalRequirements) {
      logger.info(
        `Will not move funds from ${whale} to ${input.from} for ${inputToken}: Current balance ${bal.balance} is greater than expected ${input.setup.userBalanceAndApprovalRequirements}`
      )
      return
    }
    const data = erc20Interface.encodeFunctionData('transfer', [
      input.from,
      input.setup.userBalanceAndApprovalRequirements,
    ])
    await fork.setBalance(whale, ONE_ETH * 10n)

    const result = await fork.commitTx(
      {
        to: input.setup.inputTokenAddress,
        from: whale,
        data,
        value: 0n,
      },
      () => { }
    )

    if (result.receipt.status != 1) {
      console.log(result)
      throw new Error(
        `Failed to move funds from ${whale} to ${input.from} for ${input.setup.inputTokenAddress}`
      )
    } else {
      logger.debug(
        `Moved funds from ${whale} to ${input.from} for ${input.setup.inputTokenAddress}`
      )
    }
  }

  const setAllowance = async (
    fork: SimulatorFork,
    token: string,
    owner: string,
    spender: string,
    amount: bigint
  ) => {
    const data = erc20Interface.encodeFunctionData('approve', [spender, amount])
    const res = await fork.commitTx(
      {
        to: token,
        from: owner,
        data,
        value: 0n,
      },
      () => { }
    )

    if (res.receipt.status != 1) {
      logger.error(
        `(owner=${owner}) ${token}.approve(${spender}, ${amount}) failed`
      )
    } else {
      logger.debug(
        `(owner=${owner}) ${token}.approve(${spender}, ${amount}) succeeded`
      )
    }
  }

  const getAllowance = async (
    fork: SimulatorFork,
    token: string,
    owner: string,
    spender: string
  ) => {
    const data = erc20Interface.encodeFunctionData('allowance', [
      owner,
      spender,
    ])
    const res = await fork.commitTx(
      {
        to: token,
        from: owner,
        data,
        value: 0n,
      },
      () => { }
    )

    if (res.receipt.status != 1) {
      logger.error(`(owner=${owner}) ${token}.allowance(${spender}) failed`)
      return null
    }
    const allowance = BigInt(res.execResult.returnValue)
    logger.debug(
      `(owner=${owner}) ${token}.allowance(${spender}) succeeded: ${allowance}`
    )
    return allowance
  }

  return async (input: SimulateParams) => {
    const fork = await simulator.fork()
    const startTimeSetup = Date.now()

    if (input.setup.inputTokenAddress === ethers.constants.AddressZero) {
      logger.debug(
        `Input is ETH, setting balance of ${input.from} to ${input.setup.userBalanceAndApprovalRequirements + 10n * ONE_ETH
        }`
      )
      await fork.setBalance(input.from, input.value + 10n * ONE_ETH)
    } else {
      await fork.setBalance(input.from, 10n * ONE_ETH)
      const whale = whales[input.setup.inputTokenAddress.toLowerCase()]
      if (whale != null) {
        try {
          // logger.info(`Moving funds from ${whale} to ${input.from} for ${input.setup.inputTokenAddress}`);
          await moveFundsUsingERC20Abi(fork, input, whale)
        } catch (e) {
          console.log(e)
          console.log(
            `Failed to move funds from ${whale} to ${input.from} for ${input.setup.inputTokenAddress}, trying to edit storage instead`
          )
          await setERC20BalanceUsingStorage(fork, input)
        }
      } else {
        await setERC20BalanceUsingStorage(fork, input)
      }
      const currentAllowance = await getAllowance(
        fork,
        input.setup.inputTokenAddress,
        input.from,
        input.to
      )
      if (
        currentAllowance == null ||
        currentAllowance < input.setup.userBalanceAndApprovalRequirements
      ) {
        await setAllowance(
          fork,
          input.setup.inputTokenAddress,
          input.from,
          input.to,
          0n
        )
        await setAllowance(
          fork,
          input.setup.inputTokenAddress,
          input.from,
          input.to,
          input.setup.userBalanceAndApprovalRequirements
        )
      }
    }
    const setupTime = Date.now() - startTimeSetup

    const startTime = Date.now()
    lastSubmission = Date.now()
    const timeSinceLastSubmission = Date.now() - lastSubmission
    if (timeSinceLastSubmission < 10) {
      await wait(Math.floor((10 - timeSinceLastSubmission + Math.random() * 10)))
    }
    const simulationResult = await fork.commitTx(
      {
        to: input.to,
        from: input.from,
        data: input.data,
        value: input.value,
      },
      (log) => { }
    )

    // console.log(
    //   JSON.stringify(simulationResult.accessList,null,2)
    // )
    return simulationResult.execResult.returnValue
  }
}

export const createRPCProviderUsingSim = async (
  originalProvider: JsonRpcProvider,
  sim: ForkySimulator,
  opts: {
    chainId: number
    onLog: OnLogFn
  }
) => {
  const simulateTx = async (tx: TransactionRequest) => {
    const self = await sim.fork()
    const txData = {
      to: tx.to!,
      from: tx.from ?? '0x0000000000000000000000000000000000000000',
      data: tx.data == null ? '0x' : hexlify(tx.data),
      value: tx.value == null ? 0n : BigInt(tx.value.toString()),
    }
    const out = await self.simulateTx(txData, () => { })
    return out
  }
  const createFork = (block: number) => {
    return {
      block,
      fork: sim.fork(),
    }
  }
  let latestGetterFork = createFork(await originalProvider.getBlockNumber())
  let currentBlock = latestGetterFork.block
  originalProvider.on('block', async (blockNumber) => {
    currentBlock = blockNumber
    await sim.onBlock(blockNumber)
  })

  const handlers = {
    eth_call: async ([tx, _, __]: [TransactionRequest, string, any]) => {
      const res = await simulateTx(tx)
      const out = res.execResult.returnValue
      return out
    },
    eth_blockNumber: async () => {
      return currentBlock
    },
    eth_chainId: async () => {
      return hexlify(BigInt(opts.chainId))
    },
    eth_gasPrice: async () => {
      return 1n
    },
  }

  class BoundProvider extends JsonRpcProvider {
    constructor() {
      super(originalProvider.connection.url)
    }
    async send(method: keyof typeof handlers, params: Array<any> = []) {
      if (handlers[method] == null) {
        return await originalProvider.send(method, params)
      }
      const out = await handlers[method](params as any)
      return out
    }
  }

  return new BoundProvider()
}
