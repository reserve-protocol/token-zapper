// Standard first in first out queue
export class Queue<T> {
  private data: T[] = []
  private cursorStart = 0

  public push(...items: T[]) {
    this.data.push(...items)
    if (this.currentGap() < this.data.length / 2) {
      this.shiftToFront()
    }
  }

  public pop(): T {
    if (this.cursorStart >= this.data.length) {
      throw new Error('Queue is empty')
    }
    const item = this.data[this.cursorStart]
    this.cursorStart++
    if (this.currentGap() < this.data.length / 2) {
      this.shiftToFront()
    }
    return item
  }

  private currentGap() {
    return this.data.length - this.cursorStart
  }

  public get length() {
    return this.data.length - this.cursorStart
  }

  public get isEmpty() {
    return this.length === 0
  }

  public get isNotEmpty() {
    return this.length !== 0
  }

  public *[Symbol.iterator]() {
    for (let i = this.cursorStart; i < this.data.length; i++) {
      yield this.data[i]
    }
  }

  private shiftToFront() {
    for (let i = this.cursorStart; i < this.data.length; i++) {
      this.data[i - this.cursorStart] = this.data[i]
    }
    this.data.length = this.data.length - this.cursorStart
    this.cursorStart = 0
  }
}
