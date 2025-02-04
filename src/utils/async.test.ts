import { describe, expect, it, vi } from 'vitest'
import { asyncForEach, Break } from './async.js'

describe('asyncForEach', () => {
  it('should loop over values', async () => {
    const mockCallback = vi.fn()
    const data = [1, 2, 3]
    await asyncForEach(data, mockCallback)
    expect(mockCallback).toHaveBeenCalledTimes(3)
    expect(mockCallback.mock.calls).toEqual([[1, 0, data], [2, 1, data], [3, 2, data]])
  })

  it('should break on encountering Break', async () => {
    const mockCallback: any = vi.fn(async (value: number) => {
      if (value === 2) return Break
    })
    const data = [1, 2, 3]
    await asyncForEach(data, mockCallback)
    expect(mockCallback).toHaveBeenCalledTimes(2)
    expect(mockCallback.mock.calls).toEqual([[1, 0, data], [2, 1, data]])
  })
})
