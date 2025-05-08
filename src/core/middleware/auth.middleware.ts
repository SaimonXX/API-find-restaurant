import { envVars } from '@src/config/env.config.js'

import { IRequestWithUser, IVerifiedTokenPayload } from '@src/modules/auth/interfaces/auth.controller.interface.js'
import { IAuthRepository } from '@src/modules/auth/interfaces/auth.respository.interface.js'

import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../errors/UnauthorizedError.js'

const createAutenticatorToken = (authRepository: IAuthRepository) =>
  async (req: IRequestWithUser, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization

      if (token == null) throw new UnauthorizedError('Unauthorized error, token is required')

      const decodedPayload = jwt.verify(token, envVars.JWT_SECRET) as IVerifiedTokenPayload & jwt.JwtPayload

      const jti = decodedPayload.jti
      const exp = decodedPayload.exp
      if ((jti == null) || (exp == null)) throw new UnauthorizedError('Invalid Token')
      const blackListToken = await authRepository.isTokenBlacklisted(jti)

      if (blackListToken) throw new UnauthorizedError('This token is no longer valid')
      req.user = decodedPayload
      next()
    } catch (error) {
      next(error)
    }
  }

export { createAutenticatorToken }
