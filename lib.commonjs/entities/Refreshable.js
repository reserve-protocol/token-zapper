"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Refreshable = void 0;
class Refreshable {
    address;
    refreshAddress;
    lastUpdate = -1;
    constructor(address, currentBlock, refreshAddress) {
        this.address = address;
        this.refreshAddress = refreshAddress;
        this.lastUpdate = currentBlock;
    }
    async refresh(block) {
        if (this.lastUpdate === block) {
            return;
        }
        this.lastUpdate = block;
        await this.refreshAddress();
    }
}
exports.Refreshable = Refreshable;
//# sourceMappingURL=Refreshable.js.map