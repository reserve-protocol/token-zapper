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
import { Universe, Searcher, configuration } from '@reserve/token-zapper'
```

Then, create the searcher universe `Universe`, and instantiate a `Searcher` ,

```typescript
const universe = await Universe.createWithConfig(provider, configuration.eth)
const searcher = new Searcher(universe)
```

Use the searcher to find a swap:

```typescript
const result = await searcher.findSingleInputToRTokenZap({
    input: universe.commonTokens.ERC20ETH.fromDecimal("0.1"),
    rToken: universe.rTokens.eUSD!,
    signerAddress: Address.fromHexString(YOUR ADDRESS)
});

console.log(result.describe().join("\n"))
```

This should generate an output that looks like the one below:

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

The `SearcherResult` will show you the path the path the searcher will use and an on the individual swaps it will execute. The `SearcherResult` can be converted into a transaction via the `.toTransaction()` method on the `SearcherResult`. This will encode all the individual `Action's` into something the `ZapperExecutor` can run. It will also simulate the transaction and estimate gas.

```typescript
const transaction = await searcherResult.toTransaction()

console.log(transaction.toString())
// ZapTransaction(input:0.1 ETH,outputs:[180.95878994 eUSD],txFee:0.015921885964378245 ETH)

// To execute the transaction simply sign the transaction.tx, and send it via a provider
const pendingTx = await provider.sendTransaction(
  await wallet.signTransaction(transaction.tx)
)
```

## Current features and limitations

Library can currently only resolve one `RToken` at a time, so `RToken`'s requiring RTokens will probably cause the code to bail out.

Library does currently not support Zapper from an `RToken` into another `RToken`, but it is definitely on the agenda.

Library is fully set up to do searching itself, but due to time constraints the current version only supports dex aggregators (1inch), to result any trading.

## Contributing

Contributions to this project are always welcome! Here are a few ways you can help:

    Report bugs or issues by opening a new issue on the GitHub repository.
    Implement new features by opening a pull request on the GitHub repository.
    Improve the documentation by suggesting edits or additions.

Before submitting a pull request, please make sure your changes pass the existing tests and add new tests if necessary.

## License

This project is licensed under the Blue Oak Model License - see the LICENSE file for details.
