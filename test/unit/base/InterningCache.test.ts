import { InterningCache } from '../../../src.ts/base/InterningCache'

class TestEntity {
  constructor(public id: string) {}
}

describe('InterningCache', () => {
  const idFn = (entity: TestEntity) => entity.id
  let cache: InterningCache<TestEntity>

  beforeEach(() => {
    cache = new InterningCache(idFn)
  })

  test('should intern and return the same instance for equal entities', () => {
    const entity1 = new TestEntity('1')
    const entity2 = new TestEntity('1')

    const cached1 = cache.get(entity1)
    const cached2 = cache.get(entity2)

    expect(cached1).toBe(cached2)
  })

  test('should return different instances for distinct entities', () => {
    const entity1 = new TestEntity('1')
    const entity2 = new TestEntity('2')

    const cached1 = cache.get(entity1)
    const cached2 = cache.get(entity2)

    expect(cached1).not.toBe(cached2)
  })

  test('should remove weakly referenced entities during garbage collection', async () => {
    let entity1 = new TestEntity('1')
    let entity2 = new TestEntity('2')
    let entity3 = new TestEntity('3')

    cache.get(entity1)
    cache.get(entity2)
    cache.get(entity3)

    expect(cache.size).toBe(3)

    // Set entity references to null to allow garbage collection
    // @ts-ignore
    entity1 = entity2 = entity3 = null

    // Trigger garbage collection manually (only in Node.js >= v14.x.x)
    if (global.gc) {
      global.gc()
    }

    // Wait for garbage collection (not ideal, but there's no other reliable method)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Trigger cache collection
    eval("%CollectGarbage('all')")
    cache.collect()

    expect(cache.size).toBe(0)
  })

  test('toString method should return a string representation of the cache', () => {
    const entity1 = new TestEntity('1')
    const entity2 = new TestEntity('2')

    cache.get(entity1)
    cache.get(entity2)

    const expected = `InterningCache({[1 => ${entity1}], [2 => ${entity2}]})`
    expect(cache.toString()).toBe(expected)
  })
})
