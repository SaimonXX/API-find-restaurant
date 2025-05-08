import { NextFunction, Request, Response } from 'express'

interface ITransactionController {
  getHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>
}

export { ITransactionController }
