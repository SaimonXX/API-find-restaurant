import { NextFunction, Request, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'

interface IAuthController {
  register: (req: Request, res: Response, next: NextFunction) => Promise<void>
  login: (req: Request, res: Response, next: NextFunction) => Promise<void>
  logout: (req: Request, res: Response, next: NextFunction) => Promise<void>
}

interface IRequestWithUser extends Request {
  user?: IVerifiedTokenPayload & JwtPayload
}

interface IVerifiedTokenPayload {
  userId: number
  email: string
  jti: string
}

export { IAuthController, IRequestWithUser, IVerifiedTokenPayload }
