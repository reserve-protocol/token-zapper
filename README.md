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
  fromProvider
} from '@reserve-protocol/token-zapper'
```

```typescript

// The fromProvider<1> in the fromProvider method, specifies the chainId. 
//   1 for ethereum mainnet
//   8453 for base
//   42161 for arbitrum
const zapperState = await fromProvider<1>(
  provider
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

```
const yourAddress = "0x....."
const zapTx = await zapperState.zap(
  zapperState.commonTokens.USDC.from(1000.0),
  zapperState.rTokens.eUSD,
  yourAddress
);

// const zapTx = await zapperState.redeem(
//  zapperState.rTokens.eUSD.from(1000.0),
//  zapperState.commonTokens.USDC,
//  yourAddress
// );

// You can get an overview of the zap transaction by describing it:
console.log(zapTx.describe().join("\n"));
```

```
Transaction {
  zap: 100000.0 USDC (99995.0 USD) -> 31.282717305975456267 ETH+ (98273.98377038 USD) (+ $183.56379896 USD D.) @ fee: 25.61216338 USD,
  dust: [0.021474740048719004 rETH (73.52053689 USD), 0.000000000000000001 stETH (0.0 stETH), 0.030485670541067423 wstETH (110.04326207 USD)],
  fees: 0.00828157863717086 ETH (25.61216338 USD) (3070865 wei)
  program: [
   cmd 0: // Curve,swap=33259.3 USDC -> 10.707839131756914597 frxETH
   amt_frxETH: uint256 = [curve-router-caller]:delegate.exchange(
      amountIn: uint256 = 33259300000,
      _expected: uint256 = 10600760740439345452,
      router: address = [0x99a5...788f],
      encodedRouterCall: bytes = [len=1666]0x000000000000000000000000a0b86991...00000000000000000000000000000000
   );

   cmd 1:
   bal_frxETH: uint256 = [tok=frxETH].balanceOf(account: address = [this]);

   cmd 2: // UniV3.exactInput(33377.2 USDC -> [USDC -> 0x8ad5...e6D8 -> WETH -> WETH -> 0xa4e0...9613 -> rETH] -> 9.699320281516622756 rETH)
   b: uint256 = [0x32F5...17A9]:delegate.exactInput(
      amountIn: uint256 = 33377200000,
      _expected: uint256 = 9675132450390646140,
      router: address = [0x68b3...Fc45],
      recipient: address = [this],
      path: bytes = [len=258]0xa0b86991c6218b36c1d19d4a2e9eb0ce...00000000000000000000000000000000
   );

   cmd 3: // Enso(33363.5 USDC, enso,lido, 10.743417369406715664 stETH)
   d: bytes[] = [0x80Eb...fB8E].routeSingle(
      tokenIn: address = [tok=USDC],
      amountIn: uint256 = 33363500000,
      commands: bytes32[] = (bytes32[]),
      state: bytes[] = (bytes[])
   );

   cmd 4:
   bal_stETH: uint256 = [tok=stETH].balanceOf(account: address = [this]);

   cmd 5:
   bal_frxETH: uint256 = [tok=frxETH].balanceOf(account: address = [this]);

   cmd 6:
   bal_rETH: uint256 = [tok=rETH].balanceOf(account: address = [this]);

   cmd 7:
   bal_stETH: uint256 = [tok=stETH].balanceOf(account: address = [this]);

   cmd 8:
   f: uint256 = [tok=sfrxETH].deposit(assets: uint256 = bal_frxETH, receiver: address = [this]);

   cmd 9:
   bal_sfrxETH: uint256 = [tok=sfrxETH].balanceOf(account: address = [this]);

   cmd 10:
   h: uint256 = [tok=wstETH].wrap(_stETHAmount: uint256 = bal_stETH);

   cmd 11:
   [this]:delegate.mintMaxRToken(facade: address = [0x81b9...eB3C], token: address = [tok=ETH+], recipient: address = [0x..yourAddress]);

   [...] // More commands to collect any leftover dust. (In the future we hope to reduce it or at least unwrap the returned tokens)
  ],
}
```

To execute your zap you just need to use the parametres in the zapTx:
```
const {
  to,
  data,
  value
} = zapTx.transaction.tx;

const signer = new ethers.Wallet([YOUR_PRIVATE_KEY], provider)
const { to, data, value } = zapTx.transaction.tx
const resp = await signer.sendTransaction({
  to,
  data,
  value
})
console.log("Tx pending, hash: ", resp.hash);
const receipt = await resp.wait(1)
console.log("Your zap was" + receipt.status === 1 ? "successfull!" : "reverted")

console.log("See it here: https://etherscan.io/tx/" + resp.hash);

```


## Contributing

Contributions to this project are always welcome! Here are a few ways you can help:

    Report bugs or issues by opening a new issue on the GitHub repository.
    Implement new features by opening a pull request on the GitHub repository.
    Improve the documentation by suggesting edits or additions.

Before submitting a pull request, please make sure your changes pass the existing tests and add new tests if necessary.

## License

This project is licensed under the Blue Oak Model License - see the LICENSE file for details.
