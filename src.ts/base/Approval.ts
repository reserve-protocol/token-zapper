import { type Address } from './Address'
import { type Token } from '../entities/Token'

export class Approval {
  constructor(
    readonly token: Token,
    readonly spender: Address,
    readonly resetApproval: boolean = false
  ) {}
  toString() {
    return `Approval(token: ${this.token}, spender: ${this.spender}, resetApproval: ${this.resetApproval})`
  }
}
