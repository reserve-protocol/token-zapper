import { type Provider } from '@ethersproject/providers'
import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { IERC20__factory } from '../contracts'
import { BlockCache } from '../base/BlockBasedCache'
import { DefaultMap } from '../base/DefaultMap'
import { constants } from 'ethers'
import { Universe } from '..'

export class TokenStateStore {
  private readonly provider: Provider
  private readonly balanceCache = new DefaultMap<
    Token,
    BlockCache<Address, TokenQuantity>
  >((token) =>
    this.universe.createCache(async (owner: Address) => {
      if (token.address.address === GAS_TOKEN_ADDRESS) {
        return token.from(await this.provider.getBalance(owner.address))
      }
      return token.from(
        await IERC20__factory.connect(
          token.address.address,
          this.provider
        ).balanceOf(owner.address)
      )
    }, 12000)
  )

  private readonly totalSupplyCache: BlockCache<Token, TokenQuantity>
  private readonly allowanceCache: BlockCache<string, bigint>
  constructor(private readonly universe: Universe) {
    this.provider = universe.provider
    this.allowanceCache = universe.createCache(async (tokenOwner: string) => {
      const [token, owner, spender] = tokenOwner.split('.')
      if (token === GAS_TOKEN_ADDRESS) {
        return constants.MaxUint256.toBigInt()
      }
      return IERC20__factory.connect(token, this.provider)
        .callStatic.allowance(owner, spender)
        .then((r) => r.toBigInt())
    }, 15 * 60 * 1000)

    this.totalSupplyCache = universe.createCache(
      async (token: Token) => {
        if (token.address.address === GAS_TOKEN_ADDRESS) {
          return token.from(0)
        }
        return token.from(
          await IERC20__factory.connect(
            token.address.address,
            this.provider
          ).callStatic.totalSupply()
        )
      },
      12000,
      (token) => token
    )
  }

  public async queryAllowance(token: Token, owner: Address, spender: Address) {
    return this.allowanceCache.get(
      `${token.address.address}.${owner.address}.${spender.address}`
    )
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

    return (await this.queryAllowance(token, owner, spender)) < amount
  }
}
