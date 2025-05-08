import { ICreateTransactionData, ISafeTransactionData } from '../transaction.model.js'

interface ITransactionRepository {
  createTransaction: (data: ICreateTransactionData) => Promise<number | undefined>
  getAllByUserId: (userId: number) => Promise<ISafeTransactionData[] | undefined>
}

export { ITransactionRepository }
