import { ApiError } from './ApiError.js'

class BadRequestError extends ApiError {
  constructor (
    message: string = 'Bad Request',
    details?: any
  ) {
    super(400, message, details)
  }
}

export { BadRequestError }
