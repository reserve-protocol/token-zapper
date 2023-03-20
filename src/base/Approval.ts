import { type Address } from '../base/Address'
import { type Token } from '../entities/Token'

export class Approval {
  constructor(readonly token: Token, readonly spender: Address) {}
  toString() {
    return `Approval(token: ${this.token}, spender: ${this.spender})`
  }
}
