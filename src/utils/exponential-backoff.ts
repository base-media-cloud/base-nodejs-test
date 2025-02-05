import { BackoffRetriesExceededError } from '../errors/errors.js'

const EXPONENTIAL_BACKOFF_BASE_TIMEOUT = 1000
const EXPONENTIAL_BACKOFF_MAX_RETRIES = 4
const EXPONENTIAL_BACKOFF_FACTOR = 2

type CreateWithBackoffParams = {
  baseTimeout?: number,
  maxRetries?: number,
  factor?: number,
  wait?: (ms: number) => Promise<any>,
}
export const createWithBackoff = ({
  baseTimeout = EXPONENTIAL_BACKOFF_BASE_TIMEOUT,
  maxRetries = EXPONENTIAL_BACKOFF_MAX_RETRIES,
  factor = EXPONENTIAL_BACKOFF_FACTOR,
  wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
}: CreateWithBackoffParams = {}) => {
  const withBackoff = async <T>(
    operation: () => Promise<T>,
    errorClass: new (...params: any[]) => Error = Error,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await operation()
    } catch (error) {
      if (!(error instanceof errorClass)) {
        throw error
      }
      if (retryCount >= maxRetries) {
        throw new BackoffRetriesExceededError('Backoff retries exceeded', { cause: error })
      }

      await wait(Math.pow(factor, retryCount) * baseTimeout)

      return withBackoff(operation, errorClass, retryCount + 1)
    }
  }

  return withBackoff
}
