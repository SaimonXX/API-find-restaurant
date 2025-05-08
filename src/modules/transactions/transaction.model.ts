interface ITransaction {
  id: number
  user_id: number
  type: 'REGISTER' | 'LOGIN' | 'LOGOUT' | 'RESTAURANT_SEARCH'
  details: string | null
  created_at: string
}

type ICreateTransactionData = Pick<ITransaction, 'user_id' | 'type' | 'details'>
type ISafeTransactionData = Pick<ITransaction, 'id' | 'type' | 'details' | 'created_at'>

export { ITransaction, ICreateTransactionData, ISafeTransactionData }
