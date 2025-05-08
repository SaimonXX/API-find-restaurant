class ApiError extends Error {
  constructor (
    public readonly statusCode: number,
    message: string,
    public readonly details?: any
  ) {
    super(message)

    Object.setPrototypeOf(this, ApiError.prototype)

    this.name = this.constructor.name

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export { ApiError }
