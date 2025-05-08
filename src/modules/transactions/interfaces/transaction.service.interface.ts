import { ISafeTransactionData } from '../transaction.model.js'

interface ITransactionService {
  getHistory: (userId: number) => Promise<ISafeTransactionData[] | undefined>
}

export { ITransactionService }
