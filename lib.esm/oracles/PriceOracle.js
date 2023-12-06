import { Cached } from '../base/Cached';
export class PriceOracle extends Cached {
    name;
    constructor(name, fetchPrice, getCurrentBlock) {
        super(k => fetchPrice(k).then(v => {
            if (v == null) {
                throw new Error('Price not found');
            }
            return v;
        }), 1, getCurrentBlock);
        this.name = name;
    }
    async quote(token) {
        return this.get(token);
    }
}
//# sourceMappingURL=PriceOracle.js.map