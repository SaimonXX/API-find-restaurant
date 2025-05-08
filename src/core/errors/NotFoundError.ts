import { ApiError } from './ApiError.js'

class NotFoundError extends ApiError {
  constructor (
    message: string = 'Not found error',
    details?: string | any
  ) {
    super(404, message, details)
  }
}

export { NotFoundError }
