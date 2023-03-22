import { ContractCall } from '../base/ContractCall'
import { type Approval } from '../base/Approval'
import { type Address } from '../base/Address'
import { IZapperExecutor__factory, IZapper__factory } from '../contracts'
import { type Token } from '../entities/Token'
import { parseHexStringIntoBuffer } from '../base/utils'
import { type Universe } from '../Universe'

export const zapperExecutorInterface =
  IZapperExecutor__factory.createInterface()
export const zapperInterface = IZapper__factory.createInterface()
export class TransactionBuilder {
  constructor(readonly universe: Universe) {}
  public contractCalls: ContractCall[] = []

  setupApprovals(approvals: Approval[]) {
    this.addCall(
      new ContractCall(
        parseHexStringIntoBuffer(
          zapperExecutorInterface.encodeFunctionData('setupApprovals', [
            approvals.map((i) => i.token.address.address),
            approvals.map((i) => i.spender.address),
          ])
        ),
        this.universe.config.addresses.executorAddress,
        0n,
        `Setup approvals: ${approvals.map((i) => i.toString()).join(', ')}`
      )
    )
  }

  drainERC20(tokens: Token[], destination: Address) {
    this.addCall(
      new ContractCall(
        parseHexStringIntoBuffer(
          zapperExecutorInterface.encodeFunctionData('drainERC20s', [
            tokens.map((i) => i.address.address),
            destination.address,
          ])
        ),
        this.universe.config.addresses.executorAddress,
        0n,
        'Cleanup'
      )
    )
  }

  addCall(call: ContractCall) {
    this.contractCalls.push(call)
  }
}
