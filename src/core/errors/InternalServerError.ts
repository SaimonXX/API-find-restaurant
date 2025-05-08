import { ApiError } from './ApiError.js'

class InternalServerError extends ApiError {
  constructor (
    message: string = 'Internal server error',
    details?: any
  ) {
    super(500, message, details)
  }
}

export { InternalServerError }
