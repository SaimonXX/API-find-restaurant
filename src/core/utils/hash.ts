import bcrypt from 'bcrypt'

const saltRounds = 10

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltRounds)
}

const comparePassword = async (plainTextPassword: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plainTextPassword, hash)
}

export { hashPassword, comparePassword }
