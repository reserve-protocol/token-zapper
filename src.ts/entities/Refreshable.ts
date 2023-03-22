import { Address } from '../base'

export class Refreshable {
  private lastUpdate = 0

  constructor(
    public readonly address: Address,
    currentBlock: number,
    private readonly refreshAddress: () => Promise<void>
  ) {
    this.lastUpdate = currentBlock
  }

  async refresh(block: number) {
    if (this.lastUpdate === block) {
      return
    }
    this.lastUpdate = block
    await this.refreshAddress()
  }
}
