import { NextFunction, Request, Response } from 'express'
import { IAuthController, IRequestWithUser } from './interfaces/auth.controller.interface.js'
import { IAuthService } from './interfaces/auth.service.interface.js'
import { UnauthorizedError } from '@src/core/errors/UnauthorizedError.js'

class AuthController implements IAuthController {
  constructor (
    private readonly authService: IAuthService
  ) {}

  async register (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUser = await this.authService.registerUser(req.body)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userInfo: newUser
      })
    } catch (error) {
      next(error)
    }
  }

  async login (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = await this.authService.loginUser(req.body)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        userData
      })
    } catch (error) {
      next(error)
    }
  }

  async logout (req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.user
      if (
        userData == null ||
        userData.exp == null
      ) throw new UnauthorizedError('User data not found to logout')

      await this.authService.logoutUser(userData.jti, userData.userId, userData.exp)
      res.status(201).json({ message: 'Logout successfully' })
    } catch (error) {
      next(error)
    }
  }
}

export { AuthController }
