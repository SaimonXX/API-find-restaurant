import express, { Express } from 'express'
import cors from 'cors'

import { IAuthRepository } from './modules/auth/interfaces/auth.respository.interface.js'

import { createAuthRouter } from '@modules/auth/auth.route.js'
import { IAuthController } from './modules/auth/interfaces/auth.controller.interface.js'

import { createRestaurantRouter } from '@modules/restaurants/restaurant.route.js'
import { IRestaurantController } from './modules/restaurants/interfaces/restaurant.controller.interface.js'

import { createTransactionRouter } from '@src/modules/transactions/transaction.route.js'
import { ITransactionController } from './modules/transactions/interfaces/transaction.controller.interface.js'
import { errorHandler } from './core/middleware/errorHandler.middleware.js'

function createApi (
  authRepository: IAuthRepository,
  authController: IAuthController,
  restaurantController: IRestaurantController,
  transactionController: ITransactionController
): Express {
  const app = express()

  const authRouter = createAuthRouter(authRepository, authController)
  const restaurantRouter = createRestaurantRouter(authRepository, restaurantController)
  const transactionRouter = createTransactionRouter(authRepository, transactionController)

  app.disable('x-powered-by')
  app.use(cors())
  app.use(express.json())

  app.get('/check', (_, res) => {
    res.status(200).json({
      status: 'server VIVITO Y COLEANDO!',
      timeStamp: new Date().toLocaleString()
    })
  })

  const apiPrefix = '/api/v1'

  app.use(`${apiPrefix}/auth`, authRouter)
  app.use(`${apiPrefix}/restaurants`, restaurantRouter)
  app.use(`${apiPrefix}/transactions`, transactionRouter)

  app.use((_req, res, _next) => {
    res.status(404).json({
      message: 'Not Found - Route does not exist'
    })
  })

  app.use(errorHandler)

  return app
}

export { createApi }
