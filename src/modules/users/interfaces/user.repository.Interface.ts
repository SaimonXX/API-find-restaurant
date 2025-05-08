import { ICreateUserData, IUser } from '../user.model.js'

interface IUserRepository {
  getByEmail: (email: string) => Promise<IUser | undefined>
  getById: (id: number) => Promise<IUser | undefined>
  create: (create: ICreateUserData) => Promise<IUser | undefined>
}

export { IUserRepository }
