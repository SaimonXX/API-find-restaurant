import { ApiError } from './ApiError.js'

class UnauthorizedError extends ApiError {
  constructor (
    message: string = 'Unauthorized error',
    details?: string | any
  ) {
    super(401, message, details)
  }
}

export { UnauthorizedError }
