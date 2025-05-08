import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { Database } from 'sqlite'
import { conectDB } from '../../src/config/db.config.js'
import { AuthRepository } from '../../src/modules/auth/auth.respository.js'
import { AuthService } from '../../src/modules/auth/auth.service.js'
import { UserRepository } from '../../src/modules/users/user.repository.js'
import { TransactionRepository } from '../../src/modules/transactions/transaction.repository.js'
import { TransactionService } from '../../src/modules/transactions/transaction.service.js'
import { TransactionController } from '../../src/modules/transactions/transaction.controller.js'
import { createTransactionRouter } from '../../src/modules/transactions/transaction.route.js'
import { errorHandler } from '../../src/core/middleware/errorHandler.middleware.js'
import { ISafeTransactionData } from '../../src/modules/transactions/transaction.model.js'

describe('Transactions Endpoints (E2E)', () => {
  let app: Express
  let db: Database
  let authToken = ''
  let testUserId: number = 0
  let authService: AuthService
  let transactionRepository: TransactionRepository

  beforeAll(async () => {
    db = await conectDB()

    const authRepository = new AuthRepository()
    transactionRepository = new TransactionRepository()
    const userRepository = new UserRepository()
    const transactionService = new TransactionService(transactionRepository)
    const transactionController = new TransactionController(transactionService)
    authService = new AuthService(authRepository, transactionRepository, userRepository)

    app = express()
    app.use(express.json())
    const transactionRouter = createTransactionRouter(authRepository, transactionController)
    app.use('/api/v1/transactions', transactionRouter)
    app.use(errorHandler)
  })

  beforeEach(async () => {
    // Crear usuario/token nuevos. Esto ya crea transacciones REGISTER y LOGIN.
    const testUser = { name: 'Tx Tester', email: `tx.tester.${Date.now()}@example.com`, password: 'password123' }
    await db.run('DELETE FROM users WHERE email LIKE ?', [`${testUser.email.split('@')[0]}%`])
    const registeredUser = await authService.registerUser(testUser)
    const loginData = await authService.loginUser({ email: testUser.email, password: testUser.password })
    authToken = loginData.token
    testUserId = registeredUser.id
    if (typeof authToken !== 'string' || authToken === '' || typeof testUserId !== 'number' || testUserId === 0) {
      throw new Error('Failed to get valid auth token or user ID in beforeEach for transaction tests.')
    }
  })

  describe('GET /api/v1/transactions', () => {
    it('should FAIL if no token is provided (401)', async () => {
      const response = await request(app).get('/api/v1/transactions')
      expect(response.status).toBe(401)
      expect(response.body.message).toEqual('Unauthorized error, token is required')
    })

    it('should PASS and return user transaction history', async () => {
      // Añadimos manualmente otras transacciones para este usuario.
      const searchDetails = JSON.stringify({ searchParams: { city: 'TestCity' }, resultsCount: 5 })
      await transactionRepository.createTransaction({ user_id: testUserId, type: 'RESTAURANT_SEARCH', details: searchDetails })
      await transactionRepository.createTransaction({ user_id: testUserId, type: 'LOGOUT', details: 'User logged out' })

      // Obtener el historial
      const response = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', authToken)

      // Verificar la respuesta
      expect(response.status).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      const transactions = response.body as ISafeTransactionData[]

      // Verifica que haya el número esperado de transacciones (REGISTER + LOGIN + SEARCH + LOGOUT = 4)
      expect(transactions.length).toEqual(4)

      // Verifica que las transacciones tengan la estructura esperada
      expect(transactions[0]).toHaveProperty('id')
      expect(transactions[0]).toHaveProperty('type')
      expect(transactions[0]).toHaveProperty('details')
      expect(transactions[0]).toHaveProperty('created_at')

      // Verifica que los tipos de transacción esperados estén presentes
      const transactionTypes = transactions.map(tx => tx.type)
      expect(transactionTypes).toContain('REGISTER')
      expect(transactionTypes).toContain('LOGIN')
      expect(transactionTypes).toContain('RESTAURANT_SEARCH')
      expect(transactionTypes).toContain('LOGOUT')

      // Verifica el detalle de una transacción específica (opcional)
      const searchTx = transactions.find(tx => tx.type === 'RESTAURANT_SEARCH')
      expect(searchTx?.details).toEqual(searchDetails)
    })

    it('should return an empty array if user has no transactions (besides REGISTER/LOGIN)', async () => {
      // El beforeEach ya creó REGISTER y LOGIN. No añadimos más.

      const response = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', authToken)

      expect(response.status).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      const transactions = response.body as ISafeTransactionData[]
      expect(transactions.length).toEqual(2)
      const transactionTypes = transactions.map(tx => tx.type)
      expect(transactionTypes).toContain('REGISTER')
      expect(transactionTypes).toContain('LOGIN')
    })
  })
})
