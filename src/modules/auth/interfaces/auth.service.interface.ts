import { ISafeUserData } from '@src/modules/users/user.model.js'
import { ILoginUserDTO } from '../dto/LoginUser.dto.js'
import { IRegisterUserDTO } from '../dto/RegisterUser.dto.js'

interface IAuthService {
  registerUser: (registerData: IRegisterUserDTO) => Promise<ISafeUserData>
  loginUser: (loginData: ILoginUserDTO) => Promise<{ token: string, user: ISafeUserData }>
  logoutUser: (jti: string, userId: number, expiresAtTimestamp: number) => Promise<void>
}

export { IAuthService }
