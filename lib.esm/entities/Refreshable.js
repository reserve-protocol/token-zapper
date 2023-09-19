export class Refreshable {
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
//# sourceMappingURL=Refreshable.js.map