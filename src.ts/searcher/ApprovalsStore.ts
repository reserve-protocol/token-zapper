import { type Provider } from '@ethersproject/providers'
import { type Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { ERC20__factory } from '../contracts/factories/@openzeppelin/contracts/token/ERC20/ERC20__factory'

export class ApprovalsStore {
  constructor(private readonly provider: Provider) { }

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
            const allowance = await ERC20__factory.connect(
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
