const called = new Set();
export const importAbi = (name) => {
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
        return await import(name, { assert: { type: "json" } }).then(i => i.default);
    };
};
//# sourceMappingURL=importAbi.js.map