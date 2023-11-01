import { type Provider } from '@ethersproject/providers'
import { type Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { IERC20__factory } from '../contracts/factories/contracts/IERC20__factory';
import { type Universe } from '../Universe';
import { GAS_TOKEN_ADDRESS } from '../base/constants';

export class ApprovalsStore {
  constructor(private readonly provider: Provider) { }

  private readonly cache = new Map<string, Promise<boolean>>()
  public async queryAllowance(
    token: Token,
    owner: Address,
    spender: Address
  ) {
    return await IERC20__factory.connect(
      token.address.address,
      this.provider
    ).allowance(owner.address, spender.address)
  }

  public async queryBalance(
    token: Token,
    owner: Address,
    universe: Universe
  ) {
    if (token === universe.nativeToken) {
      return token.from(await this.provider.getBalance(owner.address))
    }
    return token.from(await IERC20__factory.connect(
      token.address.address,
      this.provider
    ).balanceOf(owner.address))
  }
  public async needsApproval(
    token: Token,
    owner: Address,
    spender: Address,
    amount: bigint
  ): Promise<boolean> {
    if (token.address.address === GAS_TOKEN_ADDRESS) {
      return false
    }
    const key = `${token}.${owner}.${spender}`
    let check = this.cache.get(key)
    if (check == null) {
      check = new Promise((resolve, reject) => {
        void (async () => {
          try {
            const allowance = await this.queryAllowance(
              token,
              owner,
              spender
            )
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