export class BlockCache<Input, Result extends NonNullable<any>, Key=Input> {
  constructor(
    private readonly fetch: (key: Input) => Promise<Result>,
    private readonly blocksToLive: number,
    private currentBlock: number,
    private keyFn: (key: Input) => Key = x => x as any as Key
  ) {}

  private cache = new Map<Key, { result: Promise<Result>; time: number }>()

  get(key: Input): Promise<Result> {
    const k = this.keyFn(key);
    let out = this.cache.get(k)
    if (out == null) {
      const res = this.fetch(key)
      out = { result: res, time: this.currentBlock }
      this.cache.set(k, out)
    }
    return out.result
  }

  public onBlock(block: number) {
    this.currentBlock = block
    for (const [key, { time }] of [...this.cache.entries()]) {
      if (block - time > this.blocksToLive) {
        this.cache.delete(key)
      }
    }
  }
}
