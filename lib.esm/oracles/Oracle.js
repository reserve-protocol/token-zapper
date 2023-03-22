import { DefaultMap } from '../base/DefaultMap';
const NULL_VAL = { result: null, block: 0 };
export class Oracle {
    name;
    fairTokenPriceImplementation;
    constructor(name, fairTokenPriceImplementation) {
        this.name = name;
        this.fairTokenPriceImplementation = fairTokenPriceImplementation;
    }
    currentPrices = new DefaultMap(async () => await Promise.resolve(NULL_VAL));
    async fairTokenPrice(block, token) {
        const current = await (this.currentPrices.get(token) ??
            Promise.resolve(NULL_VAL));
        if (current.block < block) {
            this.currentPrices.set(token, this.fairTokenPriceImplementation(token).then((result) => ({
                result,
                block,
            })));
        }
        return await this.currentPrices.get(token).then(({ result }) => result);
    }
}
//# sourceMappingURL=Oracle.js.map