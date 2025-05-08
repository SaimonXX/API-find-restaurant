import jwt from 'jsonwebtoken'
import { envVars } from '@src/config/env.config.js'
import { randomUUID } from 'node:crypto'

import { comparePassword, hashPassword } from '@src/core/utils/hash.js'
import { ConflictError, UnauthorizedError } from '@src/core/errors/index.js'

import { IRegisterUserDTO } from './dto/RegisterUser.dto.js'
import { IUserRepository } from '../users/interfaces/user.repository.Interface.js'
import { ITransactionRepository } from '../transactions/interfaces/transaction.respository.interface.js'
import { IAuthService } from './interfaces/auth.service.interface.js'
import { ISafeUserData } from '../users/user.model.js'
import { ILoginUserDTO } from './dto/LoginUser.dto.js'
import { IAuthRepository } from './interfaces/auth.respository.interface.js'
import { IVerifiedTokenPayload } from './interfaces/auth.controller.interface.js'
import { InternalServerError } from '@src/core/errors/InternalServerError.js'

class AuthService implements IAuthService {
  constructor (
    private readonly authRepository: IAuthRepository,
    private readonly transactionReposiroty: ITransactionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async registerUser (registerData: IRegisterUserDTO): Promise<ISafeUserData> {
    const existingUser = await this.userRepository.getByEmail(registerData.email)
    if (existingUser != null) throw new ConflictError('An account with this email already exists')
    const passwordHash = await hashPassword(registerData.password)
    const newUser = await this.userRepository.create({
      name: registerData.name,
      email: registerData.email,
      password_hash: passwordHash
    })
    if (newUser == null) throw new InternalServerError('Failed to create user in database')
    await this.transactionReposiroty.createTransaction({
      user_id: newUser.id,
      type: 'REGISTER',
      details: 'User create account'
    })
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    }
  }

  async loginUser (loginData: ILoginUserDTO): Promise<{ token: string, user: ISafeUserData }> {
    const user = await this.userRepository.getByEmail(loginData.email)
    if (user == null) throw new UnauthorizedError('Invalid email or passworrd')
    const isPasswordValid = await comparePassword(loginData.password, user.password_hash)
    if (!isPasswordValid) throw new UnauthorizedError('Invalid email or passworrd')
    await this.transactionReposiroty.createTransaction({
      user_id: user.id,
      type: 'LOGIN',
      details: 'Login of user'
    })
    const payload: IVerifiedTokenPayload = {
      userId: user.id,
      email: user.email,
      jti: randomUUID()
    }
    const token = jwt.sign(
      payload,
      envVars.JWT_SECRET,
      { expiresIn: envVars.JWT_EXPIRES_IN }
    )
    const safeUserData: ISafeUserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
    return {
      token,
      user: safeUserData
    }
  }

  async logoutUser (jti: string, userId: number, expiresAtTimestamp: number): Promise<void> {
    await this.authRepository.invalidateToken(jti, userId, expiresAtTimestamp)
    await this.transactionReposiroty.createTransaction({
      user_id: userId,
      type: 'LOGOUT',
      details: 'Logout of user'
    })
  }
}

export { AuthService }
