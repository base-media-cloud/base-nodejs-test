import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWithBackoff } from './exponential-backoff.js'
import { BackoffRetriesExceededError } from '../errors/errors.js'

describe('createWithBackoff', () => {
  const mockOperation = vi.fn()
  const mockWait = vi.fn()

  beforeEach(() => {
    mockOperation.mockClear()
    mockWait.mockClear()
  })

  it('should successfully complete the operation without retries', async () => {
    const withBackoff = createWithBackoff({ wait: mockWait })
    mockOperation.mockResolvedValueOnce('success')

    const result = await withBackoff(mockOperation)

    expect(result).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(mockWait).not.toHaveBeenCalled()
  })

  it('should retry the operation on error and succeed', async () => {
    const withBackoff = createWithBackoff({ wait: mockWait })
    mockOperation
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce('success')

    const result = await withBackoff(mockOperation)

    expect(result).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(2)
    expect(mockWait).toHaveBeenCalledWith(1000)
  })

  it('should retry up to the maximum number of retries and then throw a BackoffRetriesExceededError', async () => {
    const withBackoff = createWithBackoff({ maxRetries: 2, wait: mockWait })
    mockOperation.mockRejectedValue(new Error('Persistent error'))

    await expect(withBackoff(mockOperation)).rejects.toThrow(BackoffRetriesExceededError)

    expect(mockOperation).toHaveBeenCalledTimes(3)
    expect(mockWait).toHaveBeenCalledTimes(2)
    expect(mockWait).toHaveBeenCalledWith(1000)
    expect(mockWait).toHaveBeenCalledWith(2000)
  })

  it('should allow customization of base timeout, retries, and factor', async () => {
    const withBackoff = createWithBackoff({ baseTimeout: 500, maxRetries: 3, factor: 3, wait: mockWait })
    mockOperation
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success')

    const result = await withBackoff(mockOperation)

    expect(result).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(3)
    expect(mockWait).toHaveBeenCalledWith(500)
    expect(mockWait).toHaveBeenCalledWith(1500)
  })

  it('should throw the original error if it is not an instance of the specified error class', async () => {
    class RetriableError extends Error {}
    class UnknownError extends Error {}
    const withBackoff = createWithBackoff({ wait: mockWait })
    mockOperation.mockRejectedValue(new UnknownError('Non-retriable error'))

    await expect(withBackoff(mockOperation, RetriableError)).rejects.toThrow(UnknownError)

    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(mockWait).not.toHaveBeenCalled()
  })

  it('should use the custom error class for retries', async () => {
    class CustomRetryError extends Error {}
    const withBackoff = createWithBackoff({ wait: mockWait })
    mockOperation
      .mockRejectedValueOnce(new CustomRetryError('Custom error'))
      .mockResolvedValueOnce('success')

    const result = await withBackoff(mockOperation, CustomRetryError)

    expect(result).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(2)
    expect(mockWait).toHaveBeenCalledWith(1000)
  })
})
