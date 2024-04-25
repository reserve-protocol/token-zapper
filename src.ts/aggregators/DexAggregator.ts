import { SwapPath } from '../searcher/Swap'
import { type SwapSignature } from './SwapSignature'
export class DexRouter {
  private cache: Map<
    string,
    Promise<{
      path: SwapPath
      timestamp: number
    }>
  > = new Map()

  constructor(
    public readonly name: string,
    private readonly swap_: SwapSignature,
    public readonly dynamicInput: boolean = false
  ) {
    setInterval(() => {
      this.cache.clear()
    }, 500)
  }

  public readonly swap: SwapSignature = async (
    src,
    dst,
    input,
    output,
    slippage
  ) => {
    // const start = Date.now()
    const key = `${input.amount}.${input.token.address.address}.${output.address.address}`
    if (this.cache.has(key)) {
      const previous = (await this.cache.get(key))!
      return previous.path
    }
    const out = this.swap_(src, dst, input, output, slippage)
      .then((path) => {
        return {
          path,
          timestamp: Date.now(),
        }
      })
      .catch((e) => {
        this.cache.delete(key)
        throw e
      })
    this.cache.set(key, out)

    return (await out).path
  };

  [Symbol.toStringTag] = 'DexAggregator'

  toString() {
    return `DexAggregator(name=${this.name})`
  }
}
