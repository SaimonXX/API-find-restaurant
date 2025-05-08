import { ApiError } from './ApiError.js'

class ConflictError extends ApiError {
  constructor (
    message: string = 'Conflict error',
    details?: string | any
  ) {
    super(409, message, details)
  }
}

export { ConflictError }
