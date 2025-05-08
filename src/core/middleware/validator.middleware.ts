import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'

const validateRequest = (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      })
      return next()
    } catch (error) {
      return next(error)
    }
  }

export { validateRequest }
