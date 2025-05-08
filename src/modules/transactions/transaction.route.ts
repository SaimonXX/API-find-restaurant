import { Router } from 'express'

import { createAutenticatorToken } from '@core/middleware/auth.middleware.js'
import { ITransactionController } from './interfaces/transaction.controller.interface.js'
import { IAuthRepository } from '../auth/interfaces/auth.respository.interface.js'

function createTransactionRouter (
  authRepository: IAuthRepository,
  transactionController: ITransactionController
): Router {
  const router = Router()
  const autenticateToken = createAutenticatorToken(authRepository)

  router.get('/',
    autenticateToken,
    transactionController.getHistory.bind(transactionController)
  )
  return router
}

export { createTransactionRouter }
