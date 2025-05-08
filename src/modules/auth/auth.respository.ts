import { conectDB } from '@config/db.config.js'
import { IAuthRepository } from './interfaces/auth.respository.interface.js'
import { InternalServerError } from '@src/core/errors/InternalServerError.js'

class AuthRepository implements IAuthRepository {
  async invalidateToken (jti: string, userId: number, expiresAtTimestamp: number): Promise<void> {
    try {
      const db = await conectDB()
      const sql = `
        INSERT OR IGNORE INTO token_blacklist
          (jti, user_id, expires_at)
        VALUES
          (?, ?, ?)
      `
      await db.run(sql, [jti, userId, expiresAtTimestamp])
    } catch (error) {
      throw new InternalServerError('Error invalidating token in the database')
    }
  }

  async isTokenBlacklisted (jti: string): Promise<boolean> {
    try {
      const db = await conectDB()
      const sql = `
      SELECT 1
      FROM token_blacklist
      WHERE jti = ?
        AND expires_at > ?
      LIMIT 1
    `
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const row = await db.get(sql, [jti, nowInSeconds])
      const isBlacklisted = row != null
      return isBlacklisted
    } catch (error) {
      throw new InternalServerError('Error checking token status in the database')
    }
  }
}

export { AuthRepository }
