/**
 * A cache that interns objects by their string representation.
 * @param idFn A function that returns a string representation of the object.
 * @param <T> The type of the object.
 * @returns The object if it is already in the cache, or the object itself if it is not.
 *
 * @example
 * const cache = new InterningCache((x: {a: number}) => x.a.toString())
 * const a = {a: 1}
 * const b = {a: 1}
 * cache.get(a) === a // true
 * cache.get(b) === a // true
 * cache.get({a: 2}) === {a: 2} // false
 * cache.get(b) === b // false because b is not interned and there is an active reference to the interned object
 *
 * @note
 * Why is this useful?
 * ECMAscript added native Map types. These allow you to use Objects as keys.
 * However, this is not very useful because the keys are compared by reference.
 *
 * So the snippet behaves than one might expect:
 * ```
 * const map = new Map()
 * map.set({a: 1}, 1)
 * map.get({a: 1}) // undefined
 * ```
 *
 * This means that you can't use the same object as a key twice, despite them structurally being the same.
 * Ethereum addresses are a good example of this.
 * They're often represented as hex strings, when in reality they're just 20 bytes of data.
 * This is a major source of errors when used in Maps, or in Recrods {}.
 *
 * The correct fix would be for two byte arrays to be considered equal if they have the same bytes,
 * or to have some way to specify a custom comparison function.
 *
 * However, this is not possible in ECMAscript.
 *
 * This class provides a workaround for this problem. It allows you to intern objects by by some key representation.
 * Then return the interned object, which can be used as a key.
 *
 * ECMAScript is working on a fix for this called Records and Tuples.
 * ```
 * const m = new Map()
 * m.set(#{ prop: 1 }, 42)
 * log("record in map", m.get(#{ prop: 1 }))
 *
 * const mm = new Map()
 * mm.set(#[1, 2, 3], 42)
 * log("tuple in map", mm.get(#[1, 2, 3]))
 * ```
 */
export declare class InterningCache<T extends object> {
    private readonly idFn;
    private readonly entities;
    constructor(idFn: (t: T) => string);
    private lastCollect;
    get size(): number;
    collect(): void;
    getByString(key: string): WeakRef<T> | undefined;
    get(inst: T): T;
    toString(): string;
    readonly [Symbol.toStringTag] = "InterningCache";
}
