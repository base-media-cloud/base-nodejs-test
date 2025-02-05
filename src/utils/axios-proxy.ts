import { AxiosError, AxiosInstance } from 'axios'
import { RateLimitError } from 'src/errors/errors.js'

export function createAxiosProxy(axiosInstance: AxiosInstance): AxiosInstance {
  return new Proxy(axiosInstance, {
    get(target, prop, receiver) {
      const originalValue = Reflect.get(target, prop, receiver)

      if (typeof originalValue !== 'function') {
        return originalValue
      }

      return async function(this: any, ...args: any[]) {
        try {
          return await originalValue.apply(this, args)
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error?.response?.status === 429) {
              throw new RateLimitError('API rate limit exceeded', { cause: error })
            }
          }
          throw error
        }
      }
    }
  })
}
