export class DefaultMap<A, B> extends Map<A, B> {
  constructor (private readonly defaultFn: (k: A) => B) {
    super()
  }

  get (key: A): B {
    let out = super.get(key)
    if (out == null) {
      out = this.defaultFn(key)
      this.set(key, out)
    }
    return out
  }
}
