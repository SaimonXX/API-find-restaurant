import { conectDB } from '@config/db.config.js'
import { ICreateTransactionData, ISafeTransactionData } from './transaction.model.js'
import { ITransactionRepository } from './interfaces/transaction.respository.interface.js'
import { InternalServerError } from '@src/core/errors/InternalServerError.js'

class TransactionRepository implements ITransactionRepository {
  async createTransaction (transactionData: ICreateTransactionData): Promise<number | undefined> {
    try {
      const db = await conectDB()
      const sql = `
      INSERT INTO transactions
        (user_id, type, details)
      VALUES
        (?, ?, ?)
      `
      const result = await db.run(sql, [
        transactionData.user_id,
        transactionData.type,
        transactionData.details
      ])
      return result.lastID
    } catch (error) {
      throw new InternalServerError('Failed to create transaction in database')
    }
  }

  async getAllByUserId (userId: number): Promise<ISafeTransactionData[] | undefined> {
    try {
      const db = await conectDB()
      const sql = `
        SELECT
          id,
          type,
          details,
          created_at
        FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
      `
      const result = await db.all(sql, [userId])
      return result
    } catch (error) {
      throw new InternalServerError('Failed to retrieve transactions for user from database')
    }
  }
}

export { TransactionRepository }
