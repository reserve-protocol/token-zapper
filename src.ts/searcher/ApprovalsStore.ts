import { type Provider } from '@ethersproject/providers'
import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'
import { type Universe } from '../Universe'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { IERC20__factory } from '../contracts'
import { BlockCache } from '../base/BlockBasedCache'
import { DefaultMap } from '../base/DefaultMap'

export class ApprovalsStore {
  private readonly balanceCache = new DefaultMap<
    Token,
    BlockCache<Address, TokenQuantity>
  >(
    (token) =>
      new BlockCache<Address, TokenQuantity>(
        async (owner: Address) => {
          if (token.address.address === GAS_TOKEN_ADDRESS) {
            return token.from(await this.provider.getBalance(owner.address))
          }
          return token.from(
            await IERC20__factory.connect(
              token.address.address,
              this.provider
            ).balanceOf(owner.address)
          )
        },
        0,
        12000
      )
  )

  private readonly totalSupplyCache = new BlockCache<Token, TokenQuantity>(
    async (token: Token) => {
      if (token.address.address === GAS_TOKEN_ADDRESS) {
        return token.from(0)
      }
      return token.from(
        await IERC20__factory.connect(
          token.address.address,
          this.provider
        ).totalSupply()
      )
    },
    0,
    12000
  )
  constructor(private readonly provider: Provider) {}

  private readonly cache = new Map<string, Promise<boolean>>()
  public async queryAllowance(token: Token, owner: Address, spender: Address) {
    return await IERC20__factory.connect(
      token.address.address,
      this.provider
    ).allowance(owner.address, spender.address)
  }

  public async queryBalance(token: Token, owner: Address) {
    return this.balanceCache.get(token).get(owner)
  }
  public async totalSupply(token: Token) {
    return this.totalSupplyCache.get(token)
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
            const allowance = await this.queryAllowance(token, owner, spender)
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
