import { NextFunction, Response } from 'express'

import { ITransactionService } from './interfaces/transaction.service.interface.js'
import { ITransactionController } from './interfaces/transaction.controller.interface.js'
import { IRequestWithUser } from '../auth/interfaces/auth.controller.interface.js'
import { BadRequestError } from '@src/core/errors/BadRequestError.js'

class TransactionController implements ITransactionController {
  constructor (
    private readonly transactionService: ITransactionService
  ) {}

  async getHistory (req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId
      if (userId == null) throw new BadRequestError('User id not found')
      const result = await this.transactionService.getHistory(userId)

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

export { TransactionController }
