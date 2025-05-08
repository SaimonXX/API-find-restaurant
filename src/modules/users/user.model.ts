interface IUser {
  id: number
  name: string
  email: string
  password_hash: string
  createdAt: Date
}

type ICreateUserData = Pick<IUser, 'name' | 'email' | 'password_hash'>
type ISafeUserData = Omit<IUser, 'password_hash'>

export { IUser, ICreateUserData, ISafeUserData }
