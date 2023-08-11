import { type JsonFragment } from "@ethersproject/abi";

const called = new Set<string>();
export const importAbi = <const Path extends string>(name: Path): () => Promise<JsonFragment[]> => () => {
    if (!called.has(name)) {
        called.add(name);
    }
    return import(name, { assert: { type: "json" } }).then(i => i.default as JsonFragment[]);
};
