import { type Address } from '../base/Address'

export class ContractCall {
  constructor (
    readonly payload: Buffer,
    readonly to: Address,
    readonly value: bigint,
    readonly comment?: string
  ) { }

  encode () {
    return {
      to: this.to.address,
      value: this.value,
      data: this.payload
    }
  }
}
