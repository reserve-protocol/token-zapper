export class DefaultMap extends Map {
    defaultFn;
    constructor(defaultFn) {
        super();
        this.defaultFn = defaultFn;
    }
    get(key) {
        let out = super.get(key);
        if (out == null) {
            out = this.defaultFn(key);
            this.set(key, out);
        }
        return out;
    }
}
//# sourceMappingURL=DefaultMap.js.map