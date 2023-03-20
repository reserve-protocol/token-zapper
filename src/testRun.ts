import { ethers } from 'ethers'
import { Address } from './base/Address'
import ethereumConfig from './configuration/ethereum'
import { StaticConfig } from './configuration/StaticConfig'
import { Universe } from './Universe'
import { V2Pool } from './entities/dexes/V2LikePool'
import { UniV2Like } from './action/UniV2Like'
import { Searcher } from './searcher/Searcher'

const UniV2Factory = Address.from('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f')
const run = async () => {
  const testUserAddr = Address.fromHexString(
    '0x0000000000007F150Bd6f54c40A34d7C3d5e9f56'
  )
  const provider = new ethers.providers.JsonRpcProvider(
    'http://57.128.92.239:8545'
  )
  const universe = await Universe.createWithConfig(provider, {
    ...ethereumConfig,
    config: new StaticConfig(ethereumConfig.config.nativeToken, {
      ...ethereumConfig.config.addresses,
      executorAddress: Address.fromHexString(
        '0xd977422c9eE9B646f64A4C4389a6C98ad356d8C4'
      ),
      zapperAddress: Address.fromHexString(
        '0x1eB5C49630E08e95Ba7f139BcF4B9BA171C9a8C7'
      ),
    }),
  })

  const USDT = universe.commonTokens.USDT!
  const WETH = universe.commonTokens.ERC20ETH!
  const pool = V2Pool.createStandardV2Pool(UniV2Factory, USDT, WETH, 3000n)
  const wethPrice = USDT.fromDecimal('1780')
  const wethInPool = WETH.fromDecimal('50')

  const usdtInPool = wethInPool.convertTo(USDT).mul(wethPrice)
  pool.updateReserves(wethInPool.amount, usdtInPool.amount)

  universe.addAction(new UniV2Like(universe, pool, '0->1'))
  universe.addAction(new UniV2Like(universe, pool, '1->0'))
  const searcher = new Searcher(universe)

  const result = await searcher.findSingleInputTokenSwap(
    universe.commonTokens.ERC20ETH!.fromDecimal("1"),
      USDT!,
      Address.ZERO
  );
  console.log(result.join("\n"))
  // // console.log(result)
  // console.log("Done")

  // const swap = await createEthereumRouter().swap(
  //   USER,
  //   USER,
  //   universe.commonTokens.ERC20GAS!.fromDecimal('0.1'),
  //   universe.commonTokens.USDT!,
  //   0.3
  // )
  // console.log(universe.currentBlock)
  // console.log(JSON.stringify(swap))

  // const searcher = new Searcher(universe)
  // const searcherResult = await searcher.findSingleInputToRTokenZap({
  //   input: universe.nativeToken.fromDecimal('0.1'),
  //   rToken: universe.rTokens.eUSD!,
  //   signerAddress: USER
  // })

  // console.log(searcherResult.describe().join('\n'))

  //   const transaction = await searcherResult.toTransaction()

  //   console.log(transaction.toString())

  //   const signer = provider.getSigner(USER)
  //   const receipt = await IZapper__factory.connect(universe.config.addresses.zapperAddress.address, signer).zapETH(
  //     transaction.params,
  //     {
  //       value: transaction.tx.value,
  //       gasLimit: transaction.gas
  //     }
  //   )
  //   const done = await receipt.wait()
  //   console.log('Gas used', done.gasUsed.toString())

  //   console.log('eUSD minted:')
  //   console.log(
  //     ethers.utils.formatUnits(
  //       await IERC20__factory.connect(
  //         universe.commonTokens.eUSD!.address.address,
  //         universe.provider
  //       ).balanceOf(USER),
  //       18
  //     )
  //   )
}

run()
