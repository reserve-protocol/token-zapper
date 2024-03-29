# Reserve token Zapper

This is a TypeScript library that enables finding the best way to swap between any token and into an RToken for the Reserve protocol.

## Installation

You can install the package using npm:

```bash
npm install @reserve-protocol/token-zapper
```

The test suite can be run using the command:

```bash
npm run test
```

## Usage

To use the library, import it in your TypeScript file:

```typescript
import {
  Address,
  createDefillama,
  setupEthereumZapper,
  ethereumConfig,
  Searcher,
  Universe,
  createKyberswap,
} from '@reserve-protocol/token-zapper'
```

Then, create the searcher universe `Universe`, and instantiate a `Searcher`.

Otherwise you need to use the `createWithConfig` factory and pass in the network you want to use.

```typescript
const universe = await Universe.createWithConfig(
  provider,
  ethereumConfig,
  setupEthereumZapper
)

// Zapper loads asynchroniously, you can wait the initialized promise to wait for it to fully bootstrap
await universe.initialized

// The zapper can use multiple dex aggregators as liquidity sources. We recommend initializing a few of these for
// better zaps
universe.dexAggregators.push(
  createDefillama('DefiLlama:macha', universe, 10, 'Matcha/0x')
)
universe.dexAggregators.push(createKyberswap('KyberSwap', universe, 50))

// The zapper does not pull data unless it's needed for a zap, so you need to hook this into your own
// on 'block' handler.
provider.on('block', async (blockNumber) => {
  universe.updateBlockState(
    blockNumber,
    (await provider.getGasPrice()).toBigInt()
  )
})

const searcher = new Searcher(universe)
```

Use the searcher to compose some transaction that will either attempt to mint eUSD, or buy it off a dex, whatever gives the better quote.

```typescript
const searchResult = await searcher.findSingleInputToRTokenZap(
    universe.nativeToken.from("1.0"),
    universe.rTokens.eUSD!,
    Address.from(your ADDRESS)
);
```
A search result contains a description of your zap based on the current state of the zapper, and state the zapper managed to infer while searching for a way to zap into the RToken.

You can use `.describe()` to dump an abstract description of how the zapper ended up assembling your token. 

```text
SwapPaths {
  inputs: 0.1 ETH
  actions:
    SwapPath {
      inputs: 0.1 WETH
      steps:
        Step 1: Exchange 0.1 WETH for 178.048635 USDT via OneInch(path=[SUSHI])
        Step 2: Exchange 44.512158 USDT for 40.059929 saUSDT via SATokenMint(Token(saUSDT))
        Step 3: Exchange 44.512158 USDT for 2001.47314954 cUSDT via CTokenMint(Token(cUSDT))
      outputs: 89.024319 USDT, 40.059929 saUSDT, 2001.47314954 cUSDT
    }
    SwapPath {
      inputs: 40.059929 saUSDT, 2001.47314954 cUSDT, 89.024319 USDT
      steps:
        Step 1: Exchange 40.059929 saUSDT,2001.47314954 cUSDT,89.024319 USDT for 178.04845398 eUSD via RTokenMint(Token(eUSD))
      outputs: 178.04845398 eUSD
    }
  outputs: 0.000093 USDT, 0.000096 saUSDT, 0.00000002 cUSDT, 178.04845398 eUSD
}
```

The `SearcherResult` will show you the path the path the searcher will use and an on the individual swaps it will execute. The `SearcherResult` can be converted into a transaction via the `.toTransaction()` method on the `SearcherResult`. This will encode all the individual `Action's` into something the `ZapperExecutor` can run. It will also simulate the transaction fully estimate gas and outputs.

```typescript
const transaction = await searcherResult.toTransaction()

console.log(transaction.toString())
// ZapTransaction(input:0.1 ETH,outputs:[180.95878994 eUSD],txFee:0.015921885964378245 ETH)

// To execute the transaction simply sign the transaction.tx, and send it via a provider
const pendingTx = await provider.sendTransaction(
  await wallet.signTransaction(transaction.tx)
)
```

You can dump a textural description of the final zap transaction if you're curious about such things.

```typescript
console.log(transaction.describe().join("\n"))
```

```
Transaction {
  Commands: [
    Setup approvals: Approval(token: WETH, spender: 0x6131B5fae19EA4f9D964eAc0408E4408b66337b5)
    Kyberswap(0x6131B5fae19EA4f9D964eAc0408E4408b66337b5) (1.0 WETH) -> (1825.486423921903285671 eUSD)
    Drain ERC20s eUSD to 0x.....
  ],
  input: 1.0 WETH
  outputs: 1834.62955555997961 eUSD
}
```

### Redemption zaps

The zapper can also work in reverse, 

```typescript
const res = await searcher.findRTokenIntoSingleTokenZap(
  universe.rTokens.eUSD!.from('50.0'),
  universe.commonTokens.USDC!,
  testUserAddr,
  0.0
)
```

**note**: If zapping from rToken into ETH, the library will silently convert the output token to WETH.

```typescript
await searcher.findRTokenIntoSingleTokenZap(
  universe.rTokens.eUSD!.from('50.0'),
  universe.nativeToken!,
  testUserAddr,
  0.0
)

// Is the same as:
await searcher.findRTokenIntoSingleTokenZap(
  universe.rTokens.eUSD!.from('50.0'),
  universe.commonTokens.ERC20GAS!,
  testUserAddr,
  0.0
)

// So end user receives WETH!
```

## Current features and limitations

**RToken to RToken zaps are not currently supported**

RToken to RToken zaps are planned for the future.

## Contributing

Contributions to this project are always welcome! Here are a few ways you can help:

    Report bugs or issues by opening a new issue on the GitHub repository.
    Implement new features by opening a pull request on the GitHub repository.
    Improve the documentation by suggesting edits or additions.

Before submitting a pull request, please make sure your changes pass the existing tests and add new tests if necessary.

## License

This project is licensed under the Blue Oak Model License - see the LICENSE file for details.
