export class Cached<Key, Result extends NonNullable<unknown>> {
    constructor(
      private readonly fetch: (key: Key) => Promise<Result>,
      private readonly ttl: number,
      private readonly currentTime: () => number
    ) { }
  
    private cache = new Map<Key, { result: Promise<Result>; time: number }>()
  
    private invalidateCache(key: Key) {
      const cached = this.cache.get(key)
      if (cached != null && this.currentTime() - cached.time > this.ttl) {
        this.cache.delete(key)
      }
    }
    private loadResource(key: Key): { result: Promise<Result>; time: number } {
      const task = this.fetch(key);
      const value = {
        result: task.then((result) => {
          if (result == null) {
            throw new Error('Resource not found')
          }
          return result;
        }),
        time: this.currentTime(),
      }
      this.cache.set(key, value)
  
      task.catch(() => {
        if (value === this.cache.get(key)) {
          this.cache.delete(key)
        }
      })
  
      return value
    }
  
    protected async get(key: Key): Promise<Result> {
      this.invalidateCache(key)
      return await ((this.cache.get(key) ?? this.loadResource(key))).result
    }
  
    protected cleanup() {
      const now = this.currentTime()
      for (const [key, { time }] of this.cache) {
        if (now - time > this.ttl) {
          this.cache.delete(key)
        }
      }
    }
  }
  