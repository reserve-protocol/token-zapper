import { DefaultMap } from '../base/DefaultMap'

class Measurement {
  private context = new DefaultMap<string, Measurement>((name) => {
    return new Measurement(name)
  })
  constructor(
    public readonly name: string,
    private count: number = 0,
    private total: number = 0,
    private max: number = 0,
    private min: number = Infinity
  ) {}

  get average() {
    return this.total / this.count
  }

  protected addPoint(time: number) {
    this.count++
    this.total += time
    this.max = Math.max(this.max, time)
    this.min = Math.min(this.min, time)
  }

  public begin(context?: string) {
    const start = Date.now()
    return () => {
      const end = Date.now()
      const time = end - start
      this.addPoint(time)
      if (context) {
        this.context.get(context).addPoint(time)
      }
    }
  }

  get contextStats() {
    return Array.from(this.context.values())
  }

  public toString() {
    return `${this.name}: ${this.count} calls, avg: ${this.average.toFixed(
      2
    )}, max: ${this.max}, min: ${this.min}`
  }
}
export class PerformanceMonitor {
  public stats = new DefaultMap<string, Measurement>((name) => {
    return new Measurement(name)
  })

  public measure<T>(name: string, fn: () => T, context?: string): T {
    const end = this.begin(name, context)
    const result = fn()
    try {
      end()
    } catch (e) {
      // console.log('Error during measurement of ' + name)
      // console.log(e)
      throw e
    }
    return result
  }

  public begin(name: string, context?: string) {
    return this.stats.get(name).begin(context)
  }
  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const end = this.begin(name, context)
    try {
      const out = await fn()
      end()
      return out
    } catch (e) {
      end()
      throw e
    }
  }

  public async measurePromise<const T extends Promise<unknown>>(
    name: string,
    promise: T,
    context?: string
  ) {
    const end = this.begin(name, context)
    try {
      const out = await promise
      end()
      return out
    } catch (e) {
      // console.log('Error during measurement of ' + name)
      // console.log(e)
      end()
      throw e
    }
  }

  public wrapFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    context?: string
  ): T {
    return ((...args: any[]) => {
      return this.measure(name, () => fn(...args), context)
    }) as T
  }

  public wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T,
    context?: string
  ): T {
    return (async (...args: any[]) => {
      return this.measurePromise(name, fn(...args), context)
    }) as T
  }

  public printStats(): string[] {
    return Array.from(this.stats.values()).map((m) => m.toString())
  }
}
