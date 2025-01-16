export class BlockCache<Input, Result extends NonNullable<any>, Key = Input> {
  private results = new Map<Key, { result: Promise<Result>; time: number }>()

  constructor(
    private readonly fetch: (key: Input) => Promise<Result>,
    private block: number,
    private readonly TTL: number,
    private keyFn: (key: Input) => Key = (x) => x as any as Key
  ) {}

  public get(key: Input): Promise<Result> {
    const k = this.keyFn(key)
    let out = this.results.get(k)
    if (out && out.time - Date.now() > this.TTL) {
      this.results.delete(k)
      out = undefined
    }
    if (out == null) {
      const res = this.fetch(key).catch((e) => {
        setTimeout(() => {
          this.results.delete(k)
        }, 500)
        throw new Error(e)
      })
      out = { result: res, time: Date.now() }
      this.results.set(k, out)
    }
    return out.result
  }

  public clear() {
    this.results.clear()
  }

  public has(key: Input) {
    const a = this.results.get(this.keyFn(key))
    return a != null
  }
}
