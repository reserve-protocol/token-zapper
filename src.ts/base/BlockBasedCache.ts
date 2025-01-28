export class BlockCache<Input, Result extends NonNullable<any>, Key = Input> {
  private results = new Map<Key, { result: Promise<Result>; time: number }>()

  constructor(
    private readonly fetch: (key: Input) => Promise<Result>,
    private block: number,
    private readonly TTL: number,
    private keyFn: (key: Input) => Key = (x) => x as any as Key
  ) {}

  public async get(key: Input) {
    const k = this.keyFn(key)
    let out = this.results.get(k) ?? null

    if (out == null) {
      out = { result: this.fetch(key), time: Date.now() + this.TTL }
      this.results.set(k, out)
    } else {
      if (out.time > Date.now()) {
        return await out.result
      }
      out.result = this.fetch(key).catch((e) => {
        // console.log(e)
        this.results.delete(k)
        throw e
      })
      out.time = Date.now() + this.TTL
      this.results.set(k, out)
    }
    return await out.result
  }

  public clear() {
    this.results.clear()
  }

  public has(key: Input) {
    const a = this.results.get(this.keyFn(key))
    return a != null
  }
}
