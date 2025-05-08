import { ITransactionRepository } from './interfaces/transaction.respository.interface.js'
import { ITransactionService } from './interfaces/transaction.service.interface.js'
import { ISafeTransactionData } from './transaction.model.js'

class TransactionService implements ITransactionService {
  constructor (
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async getHistory (userId: number): Promise<ISafeTransactionData[] | undefined> {
    const result = await this.transactionRepository.getAllByUserId(userId)
    return result
  }
}

export { TransactionService }
