export class BlockCache<Key, Result extends NonNullable<any>> {
  constructor(
    private readonly fetch: (key: Key) => Promise<Result>,
    private readonly blocksToLive: number,
    private currentBlock: number
  ) {}

  private cache = new Map<Key, { result: Promise<Result>; time: number }>()

  private loadResource(key: Key): { result: Promise<Result>; time: number } {
    const task = this.fetch(key)
    const value = {
      result: task.then((result) => {
        if (result == null) {
          throw new Error('Resource not found')
        }
        return result
      }),
      time: this.currentBlock,
    }
    this.cache.set(key, value)

    task.catch(() => {
      if (value === this.cache.get(key)) {
        this.cache.delete(key)
      }
    })

    return value
  }

  async get(key: Key): Promise<Result> {
    return await (this.cache.get(key) ?? this.loadResource(key)).result
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
