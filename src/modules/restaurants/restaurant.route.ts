import { Router } from 'express'

import { createAutenticatorToken } from '@core/middleware/auth.middleware.js'
import { IRestaurantController } from './interfaces/restaurant.controller.interface.js'
import { IAuthRepository } from '../auth/interfaces/auth.respository.interface.js'
import { validateRequest } from '@src/core/middleware/validator.middleware.js'
import { searchRestaurantsSchema } from './dto/SearchRestaurants.dto.js'

function createRestaurantRouter (
  authRepository: IAuthRepository,
  restaurantController: IRestaurantController
): Router {
  const router = Router()
  const autenticateToken = createAutenticatorToken(authRepository)

  router.get(
    '/',
    autenticateToken,
    validateRequest(searchRestaurantsSchema),
    restaurantController.findNearby.bind(restaurantController)
  )

  return router
}

export { createRestaurantRouter }
