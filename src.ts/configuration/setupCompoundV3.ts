import { MintCometAction, BurnCometAction } from '../action/Comet';
import { MintCometWrapperAction, BurnCometWrapperAction } from '../action/CometWrapper';
import { type Token } from '../entities/Token'
import { type Universe } from '../Universe';
import { WrappedComet__factory } from '../contracts/factories/Compv3.sol/WrappedComet__factory'

interface Market {
  baseToken: Token
  receiptToken: Token
  vaults: Token[]
}

export const setupSingleCompoundV3Market = async (
  universe: Universe,
  market: Market
) => {
  // Define baseToken -> receiptToken
  universe.defineMintable(
    new MintCometAction(universe, market.baseToken, market.receiptToken),
    new BurnCometAction(universe, market.baseToken, market.receiptToken)
  )

  // Set up vaults
  for (const vaultToken of market.vaults) {
    const rate = { value: market.baseToken.one.amount };
    const inst = WrappedComet__factory.connect(vaultToken.address.address, universe.provider);
    const updateRate = async () => {
      rate.value = (await inst.callStatic.exchangeRate()).toBigInt();
    };

    await updateRate()

    universe.createRefreshableEntity(vaultToken.address, updateRate);

    const getRate = async () => {
      universe.refresh(vaultToken.address)
      return rate.value
    };

    universe.defineMintable(
      new MintCometWrapperAction(universe, market.receiptToken, vaultToken,  getRate),
      new BurnCometWrapperAction(universe, market.receiptToken, vaultToken, getRate),
    )
  }
}

export const setupCompoundV3 = async (
  universe: Universe,
  markets: Market[]
) => {
  await Promise.all(markets.map(async m => {
    try {
      await setupSingleCompoundV3Market(universe, m)
    } catch (e) {
      console.error(`Failed to setup compound v3 market ${m.baseToken} ${m.receiptToken}`)
      throw e
    }
  }))
}