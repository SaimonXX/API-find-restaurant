import { envVars } from '@config/env.config.js'
import { ensureDatabaseInitialized } from '@config/db.config.js'
import { createApi } from './api.js'

import { AuthRepository } from './modules/auth/auth.respository.js'
import { AuthService } from './modules/auth/auth.service.js'
import { AuthController } from './modules/auth/auth.controller.js'

import { UserRepository } from './modules/users/user.repository.js'

import { RestaurantService } from './modules/restaurants/restaurant.service.js'
import { RestaurantController } from './modules/restaurants/restaurant.controller.js'

import { TransactionRepository } from './modules/transactions/transaction.repository.js'
import { TransactionService } from './modules/transactions/transaction.service.js'
import { TransactionController } from './modules/transactions/transaction.controller.js'

await ensureDatabaseInitialized()

const authRepository = new AuthRepository()
const transactionRepository = new TransactionRepository()
const userRepository = new UserRepository()

const authService = new AuthService(authRepository, transactionRepository, userRepository)
const authController = new AuthController(authService)

const restaurantService = new RestaurantService(transactionRepository)
const restaurantController = new RestaurantController(restaurantService)

const transactionService = new TransactionService(transactionRepository)
const transactionController = new TransactionController(transactionService)

const api1 = createApi(
  authRepository,
  authController,
  restaurantController,
  transactionController
)

const PORT = envVars.PORT ?? 3000

api1.listen(PORT, () => {
  console.log(`[SERVER] Server is running on port http://localhost:${PORT}`)
})
