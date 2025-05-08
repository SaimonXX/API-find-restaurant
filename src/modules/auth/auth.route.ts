import { Router } from 'express'

import { createAutenticatorToken } from '@core/middleware/auth.middleware.js'
import { validateRequest } from '@src/core/middleware/validator.middleware.js'

import { registerUserSchema } from './dto/RegisterUser.dto.js'
import { loginUserSchema } from './dto/LoginUser.dto.js'

import { IAuthRepository } from './interfaces/auth.respository.interface.js'
import { IAuthController } from './interfaces/auth.controller.interface.js'

function createAuthRouter (
  authRepository: IAuthRepository,
  authController: IAuthController
): Router {
  const router = Router()
  const autenticateToken = createAutenticatorToken(authRepository)

  router.post(
    '/register',
    validateRequest(registerUserSchema),
    authController.register.bind(authController)
  )
  router.post(
    '/login',
    validateRequest(loginUserSchema),
    authController.login.bind(authController)
  )
  router.post(
    '/logout',
    autenticateToken,
    authController.logout.bind(authController)
  )

  return router
}

export { createAuthRouter }
