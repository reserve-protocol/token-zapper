/**
 * A Map that returns a default value when a key is not found.
 * @param <A> The type of the key.
 * @param <B> The type of the value.
 * @param defaultFn The function to call when a key is not found.
 * @returns The value associated with the key, or the default value.
 * @example
 * const map = new DefaultMap<string, number[]>(k => ([]))
 * map.get('foo').push(1)
 * map.get('foo').push(2)
 * map.get('bar').push(3)
 * map.get('bar').length // 1
 * map.get('foo').length // 2
 * map.get('baz').length // 0
 */
export class DefaultMap<A, B> extends Map<A, B> {
  constructor(private readonly defaultFn: (k: A) => B) {
    super()
  }

  mut(key: A, fn: (v: B) => B) {
    const v = this.get(key)
    this.set(key, fn(v))
  }

  clone(): DefaultMap<A, B> {
    const out = new DefaultMap<A, B>(this.defaultFn)
    for (const [k, v] of this) {
      if (
        typeof v === 'object' &&
        v != null &&
        'clone' in v &&
        typeof v.clone === 'function'
      ) {
        out.set(k, v.clone())
      } else {
        out.set(k, v)
      }
    }
    return out
  }

  get(key: A): B {
    let out = super.get(key)
    if (out == null) {
      out = this.defaultFn(key)
      this.set(key, out)
    }
    return out
  }
}
