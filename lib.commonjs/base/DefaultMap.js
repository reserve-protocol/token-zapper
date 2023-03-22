"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMap = void 0;
class DefaultMap extends Map {
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
exports.DefaultMap = DefaultMap;
//# sourceMappingURL=DefaultMap.js.map