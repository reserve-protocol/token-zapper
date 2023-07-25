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
export declare class DefaultMap<A, B> extends Map<A, B> {
    private readonly defaultFn;
    constructor(defaultFn: (k: A) => B);
    get(key: A): B;
}
