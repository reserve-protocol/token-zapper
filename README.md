# Reserve token Zapper

This is a TypeScript library that enables finding the best way to swap between any token and into an RToken for the Reserve protocol.

## Installation

You can install the package using npm:

```bash
npm install @reserve-protocol/token-zapper
```

## Usage

To use the library, import it in your TypeScript file:

```typescript
import {
  createKyberswap,
  createParaswap,
  setupEthereumZapper,
  ethereumConfig,
  Universe,
} from '@reserve-protocol/token-zapper'
```

```typescript
const zapperState = await Universe.createWithConfig(
  provider,
  ethereumConfig,
  async (uni) => {
    uni.addTradeVenue(createKyberswap('Kyber', uni))
    uni.addTradeVenue(createParaswap('paraswap', uni))

    await setupEthereumZapper(uni)
  }
)

// Zapper loads asynchroniously, you can wait the initialized promise to wait for it to fully bootstrap
await zapperState.initialized

// The the zapper state needs to be updated with every new block,
// because a lot of internal caching is bound to the current block, and gas price determines which zap is the best for the user
provider.on('block', async (blockNumber) => {
  await zapperState.updateBlockState(
    blockNumber,
    (await provider.getGasPrice()).toBigInt()
  )
})
```

After this setup, you can use the zapper to find a way to zap into an rToken, or zap redeem it into something else

```typescript
const yourAddress = '0x.....'
const zapTx = await zapperState.zap(
  zapperState.commonTokens.USDC.from(1000.0),
  zapperState.rTokens.eUSD,
  yourAddress
)

// const zapTx = await zapperState.redeem(
//  zapperState.rTokens.eUSD.from(1000.0),
//  zapperState.commonTokens.USDC,
//  yourAddress
// );

// You can get an overview of the zap transaction by describing it:
console.log(zapTx.describe().join('\n'))
```

```
Transaction {
  zap: 100000.0 USDC (99995.0 USD) -> 99963.528513787400022714 eUSD (99970.38454138 USD) (+ $16.55167255 USD D.) @ fee: 128.34777376 USD,
  dust: [0.049995 USDC (0.049992 USD), 8.535761783034029767 sDAI (9.47060155 USD), 3.352562 saEthUSDC (3.643343 USD), 3.086402 wcUSDCv3 (3.387736 USD)],
  fees: 0.050437687161628416 ETH (128.34777376 USD) (2997536 wei)
  program: [
   // UniV3.exactInputSingle(USDC -> 0x6c6Bc977E13Df9b0de53b251522280BB72383700 -> DAI)
   cmd 0: j: uint256 = uniV3Router:delegate.exactInputSingle(
      amountIn = 25008600000,
      _expected = 25000348245652762919291,
      router = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45,
      encodedRouterCall = [len=514]0x000000000000000000000000a0b86991...00000000000000000000000000000000
   )

   // Curve,swap=24997.5 USDC -> 24993.40646 USDT,pools=0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7, 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490, 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B, 0x4e0915C88bC70750D68C481540F081fEFaF22273, 0x99a58482BD75cbab83b27EC03CA68fF489b5788f
   cmd 1: amt_USDT: uint256 = curveRouterCall:delegate.exchange(
      amountIn = 24997500000,
      _expected = 24493538331,
      router = 0x99a58482BD75cbab83b27EC03CA68fF489b5788f,
      encodedRouterCall = [len=1666]0x000000000000000000000000a0b86991...00000000000000000000000000000000
   )

   cmd 2: q: uint256 = sDAI.deposit(assets = j, receiver = this)

   // IStaticATokenV3LM.deposit(24997.049987 USDC) # -> 23000.840107 saEthUSDC
   cmd 3: r: uint256 = saEthUSDC.deposit(assets = 24997049987, receiver = this, referralCode = 0, depositToAave = true)

   cmd 4: cUSDCv3.supplyTo(dst = this, asset = USDC, amount = 24996800018)

   cmd 5: bal_cUSDCv3: uint256 = cUSDCv3.balanceOf(account = this)

   cmd 6: wcUSDCv3.deposit(amount = bal_cUSDCv3)

   cmd 7: s: uint256 = cUSDT.mint(mintAmount = amt_USDT)

   cmd 8: bal_saEthUSDC: uint256 = saEthUSDC.balanceOf(account = this)

   cmd 9: bal_wcUSDCv3: uint256 = wcUSDCv3.balanceOf(account = this)

   cmd 10: bal_cUSDT: uint256 = balanceOf.balanceOf(token = cUSDT, account = this)

   cmd 11: this:delegate.mintMaxRToken(facade = oldFacade, token = eUSD, recipient = 0x684566C9FFcAC7F6A04C3a9997000d2d58C00824)

   cmd 12: emitId:delegate.emitId(id = 91849448683435942315573679291164280168546435124101316263424399347329429050949)

  ],
}
```

To execute your zap you just need to use the parametres in the zapTx:

```typescript
const { to, data, value } = zapTx.transaction.tx

const signer = new ethers.Wallet([YOUR_PRIVATE_KEY], provider)
const { to, data, value } = zapTx.transaction.tx
const resp = await signer.sendTransaction({
  to,
  data,
  value,
})
console.log('Tx pending, hash: ', resp.hash)
const receipt = await resp.wait(1)
console.log('Your zap was' + receipt.status === 1 ? 'successfull!' : 'reverted')

console.log('See it here: https://etherscan.io/tx/' + resp.hash)
```

## Running unit tests

You can run the unit tests by running `npm run test:unit`

## Running integration tests

There is also an integration test suite, but it requires some setup to run.

The simulator uses the block diff rpc to sync the state of the simulator, this is an expensive operation when using node providers, so it is highly recommended to do so against a private RPC node. We recommend using [reth](https://reth.rs/) for this, but geth based nodes are supported.

To run the simulator clone [repo](https://github.com/jankjr/revm-router-simulator), compile it and run it locally.

Then set the `SIM_URL` environment variable to the URL of the simulator, e.g. `http://localhost:7777`

After an appropriate simulator is running, you can run the integration tests by running:

```
npm run eth:integration
npm run base:integration
npm run arbi:integration
```

Specific cases can be run by using a `testPathPattern` flag, e.g.

```
npm run integration:eth -- -t "issue" # runs all issueance tests
npm run integration:eth -- -t "redeem" # runs all redemption tests
npm run integration:eth -- -t "yield position" # runs all zap into yield position tests

npm run integration:eth -- -t "issue eUSD" # run issueance tests for eUSD
npm run integration:eth -- -t "redeem eUSD" # run redemption tests for eUSD
npm run integration:eth -- -t "yield position sdgnETH" # run zap into yield position tests for sdgnETH
```

## Contributing

Contributions to this project are always welcome! Here are a few ways you can help:

    Report bugs or issues by opening a new issue on the GitHub repository.
    Implement new features by opening a pull request on the GitHub repository.
    Improve the documentation by suggesting edits or additions.

Before submitting a pull request, please make sure your changes pass the existing tests and add new tests if necessary.

## License

This project is licensed under the Blue Oak Model License - see the LICENSE file for details.
