import { type JsonFragment } from "@ethersproject/abi";

const called = new Set<string>();
export const importAbi = <const Path extends string>(name: Path): () => Promise<JsonFragment[]> => {
    // setTimeout(() => {
    //     if (called.has(name)) {
    //         return
    //     }
    //     console.log(name)
    // }, 1500)
    return async () => {
        if (!called.has(name)) {
            called.add(name);
        }
        return await import(name, { assert: { type: "json" } }).then(i => i.default as JsonFragment[]);
    };
}