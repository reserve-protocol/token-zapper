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
  zap: 100000.0 USDC (99994.9 USD) -> 99975.562425696744803293 eUSD (99982.60831839 USD) (+ $3.32644885 USD D.) @ fee: 190.26955838 USD,
  dust: [0.275168033561621409 sDAI (0.30517785 USD), 0.342538 saEthUSDC (0.372217 USD), 109.77683024 cUSDT (2.649054 USD)],
  fees: 0.078302891451912498 ETH (190.26955838 USD) (2992017 wei)
  program: [
   cmd 0: // paraswap,router=0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57,swap=25004.574996 USDC -> 24999.063581 USDT,pools=0x3416cF6C708Da44DB2624D63ea0AAef7113527C6
   [this].rawCall(
      to: address = [0xDEF1...Ee57],
      value: uint256 = 0,
      data: bytes = [len=1346]0xa6886da9000000000000000000000000...00000000000000000000000000000000
   );

   cmd 1:
   bal_USDT: uint256 = [tok=USDT].balanceOf(account: address = [this]);

   cmd 2: // UniV3.exactInputSingle(USDC -> 0x6c6Bc977E13Df9b0de53b251522280BB72383700 -> DAI)
   c: uint256 = [0x32F5...17A9]:delegate.exactInputSingle(
      amountIn: uint256 = 25002200000,
      _expected: uint256 = 24994195970138374460306,
      router: address = [0x68b3...Fc45],
      encodedRouterCall: bytes = [len=514]0x000000000000000000000000a0b86991...00000000000000000000000000000000
   );

   cmd 3:
   bal_USDC: uint256 = [tok=USDC].balanceOf(account: address = [this]);

   cmd 4:
   bal_DAI: uint256 = [tok=DAI].balanceOf(account: address = [this]);

   cmd 5:
   bal_USDT: uint256 = [tok=USDT].balanceOf(account: address = [this]);

   cmd 6:
   e: uint256 = [tok=sDAI].deposit(assets: uint256 = bal_DAI, receiver: address = [this]);

   cmd 7:
   bal_sDAI: uint256 = [tok=sDAI].balanceOf(account: address = [this]);

   cmd 8: // 50.000349999774905% USDC
   frac_saEthUSDC: uint256 = [this]:delegate.fpMul(a: uint256 = bal_USDC, b: uint256 = 500003499997749068, scale: uint256 = 1000000000000000000);

   cmd 9: // IStaticATokenV3LM.deposit(24996.762481 USDC) # -> 23002.466853 saEthUSDC
   g: uint256 = [tok=saEthUSDC].deposit(
      assets: uint256 = frac_saEthUSDC,
      receiver: address = [this],
      referralCode: uint16 = 0,
      depositToAave: bool = true
   );

   cmd 10:
   bal_saEthUSDC: uint256 = [tok=saEthUSDC].balanceOf(account: address = [this]);

   cmd 11:
   bal_USDC: uint256 = [tok=USDC].balanceOf(account: address = [this]);

   cmd 12:
   [tok=cUSDCv3].supplyTo(dst: address = [this], asset: address = [tok=USDC], amount: uint256 = bal_USDC);

   cmd 13:
   bal_cUSDCv3: uint256 = [tok=cUSDCv3].balanceOf(account: address = [this]);

   cmd 14:
   [tok=wcUSDCv3].deposit(amount: uint256 = bal_cUSDCv3);

   cmd 15:
   bal_wcUSDCv3: uint256 = [tok=wcUSDCv3].balanceOf(account: address = [this]);

   cmd 16:
   i: uint256 = [tok=cUSDT].mint(mintAmount: uint256 = bal_USDT);

   cmd 17:
   bal_cUSDT: uint256 = [balanceOf].balanceOf(token: address = [tok=cUSDT], account: address = [this]);

   cmd 18:
   [this]:delegate.mintMaxRToken(facade: address = [0x81b9...eB3C], token: address = [tok=eUSD], recipient: address = [0x6845...0824]);

   cmd 19:
   [0x6d92...66Bb]:delegate.emitId(id: uint256 = 73443953353315612315869871934451295356890389189147558801315526084051218930036);

   ... // More commands to collect any leftover dust.

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

npm run integration:eth -- -t "issue eUSD" # run issueance tests for eUSD
npm run integration:eth -- -t "redeem eUSD" # run redemption tests for eUSD
```

## Contributing

Contributions to this project are always welcome! Here are a few ways you can help:

    Report bugs or issues by opening a new issue on the GitHub repository.
    Implement new features by opening a pull request on the GitHub repository.
    Improve the documentation by suggesting edits or additions.

Before submitting a pull request, please make sure your changes pass the existing tests and add new tests if necessary.

## License

This project is licensed under the Blue Oak Model License - see the LICENSE file for details.
