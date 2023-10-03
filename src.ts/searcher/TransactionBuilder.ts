import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { type Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { ZapperExecutor__factory } from '../contracts/factories/contracts/Zapper.sol/ZapperExecutor__factory'
import { Zapper__factory } from '../contracts/factories/contracts/Zapper.sol/Zapper__factory'
import { type Token } from '../entities/Token'


export const zapperExecutorInterface =
  ZapperExecutor__factory.createInterface()
export const zapperInterface = Zapper__factory.createInterface()
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
        BigInt(approvals.length) * 25000n,
        `Setup approvals: ${approvals.map((i) => i.toString()).join(', ')}`
      )
    )
  }

  issueMaxRTokens(rToken: Token, destination: Address) {
    this.addCall(
      new ContractCall(
        parseHexStringIntoBuffer(
          zapperExecutorInterface.encodeFunctionData('mintMaxRToken', [
            this.universe.config.addresses.facadeAddress.address,
            rToken.address.address,
            destination.address,
          ])
        ),
        this.universe.config.addresses.executorAddress,
        0n,
        600000n,
        'Issue max rTokens'
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
        BigInt(tokens.length) * 50000n,
        `Drain ERC20s ${tokens.map((i) => i.toString()).join(', ')} to ${destination}` 
      )
    )
  }

  addCall(call: ContractCall) {
    this.contractCalls.push(call)
  }

  gasEstimate() {
    return this.contractCalls.reduce((l,r) => l + r.gas, 0n)
  }
}
