import { type Address } from '../base/Address'
import { type ethers } from 'ethers'
import { type Token } from '../entities/Token'
import { IERC20__factory } from '../contracts'

export class ApprovalsStore {
  constructor(private readonly provider: ethers.providers.Provider) { }

  private readonly cache = new Map<string, Promise<boolean>>()
  public async needsApproval(
    token: Token,
    owner: Address,
    spender: Address,
    amount: bigint
  ): Promise<boolean> {
    const key = `${token}.${owner}.${spender}`
    let check = this.cache.get(key)
    if (check == null) {
      check = new Promise((resolve, reject) => {
        void (async () => {
          try {
            const allowance = await IERC20__factory.connect(
              token.address.address,
              this.provider
            ).allowance(owner.address, spender.address)
            if (allowance.lt(amount)) {
              resolve(true)
              this.cache.delete(key)
            } else {
              resolve(false)
            }
          } catch (e) {
            reject(e)
          }
        })()
      })
      this.cache.set(key, check)
    }
    return await check
  }
}

export class MokcApprovalsStore extends ApprovalsStore {
  constructor(
  ) {
    super(null as any)
  }
  async needsApproval(
    token: Token,
    owner: Address,
    spender: Address,
    amount: bigint
  ): Promise<boolean> {
    return true
  }
}
