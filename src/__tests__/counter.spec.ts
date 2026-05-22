import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // sets a active pinia instance before each test
    setActivePinia(createPinia())
  })

  it('initial state should be 0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
    expect(store.doubleCount).toBe(0)
  })

  it('increments the count', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
    expect(store.doubleCount).toBe(2)
  })

  it('decrements the count', () => {
    const store = useCounterStore()
    store.decrement()
    expect(store.count).toBe(-1)
    expect(store.doubleCount).toBe(-2)
  })

  it('resets the count', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
    store.reset()
    expect(store.count).toBe(0)
  })

  it('increments asynchronously', async () => {
    const store = useCounterStore()
    const promise = store.incrementAsync()
    // It should not increment immediately
    expect(store.count).toBe(0)
    // Wait for the async task to complete
    await promise
    expect(store.count).toBe(1)
  })
})
