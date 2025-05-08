import { ZodError } from 'zod'
import { ApiError } from '../errors/ApiError.js'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface IErrorResponse {
  success: boolean
  message: string
  errors?: Array<{ path?: Array<string | number>, message: string, code?: string }> | any
}

const errorHandler = (
  err: Error | ApiError | ZodError | jwt.JsonWebTokenError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500
  const response: IErrorResponse = {
    success: false,
    message: 'Internal server error'
  }

  if (err instanceof ZodError) {
    statusCode = 400
    response.message = 'Validation error'
    response.errors = err.errors
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode
    response.message = err.message
    response.errors = err.details
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401
    response.message = err.message
  }

  res.status(statusCode).json(response)
}

export { errorHandler }
