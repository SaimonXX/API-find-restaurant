import { conectDB } from '@config/db.config.js'
import { IUser, ICreateUserData } from './user.model.js'
import { IUserRepository } from './interfaces/user.repository.Interface.js'
import { InternalServerError } from '@src/core/errors/InternalServerError.js'

class UserRepository implements IUserRepository {
  async getByEmail (email: string): Promise<IUser | undefined> {
    try {
      const db = await conectDB()
      const sql = `
      SELECT
        id,
        name,
        email,
        password_hash,
        created_at
      FROM users
      WHERE email = ?
    `
      return await db.get(sql, [email])
    } catch (error) {
      console.error('[Error retrieving user by email]:', error)
      throw new InternalServerError('Failed to retrieve user by email from database')
    }
  }

  async getById (id: number): Promise<IUser | undefined> {
    try {
      const db = await conectDB()
      const sql = `
      SELECT
        id,
        name,
        email,
        password_hash,
        created_at
      FROM users
      WHERE id = ?
    `
      return await db.get(sql, [id])
    } catch (error) {
      throw new InternalServerError('Failed to retrieve user by ID from database')
    }
  }

  async create (create: ICreateUserData): Promise<IUser | undefined> {
    try {
      const db = await conectDB()
      const insertSql = `
        INSERT INTO users
          (name, email, password_hash)
        VALUES
          (?, ?, ?)
      `
      const { lastID } = await db.run(insertSql, [create.name, create.email, create.password_hash])
      if (lastID === undefined) throw new Error()
      return await this.getById(lastID)
    } catch (error) {
      throw new InternalServerError('Error creating user in database')
    }
  }
}

export { UserRepository }
