import request from 'supertest'
import { Express } from 'express'
import { Database } from 'sqlite'

import { createApi } from '../../src/api.js'
import { conectDB } from '../../src/config/db.config.js'
import { AuthRepository } from '../../src/modules/auth/auth.respository.js'
import { AuthService } from '../../src/modules/auth/auth.service.js'
import { AuthController } from '../../src/modules/auth/auth.controller.js'
import { UserRepository } from '../../src/modules/users/user.repository.js'
import { TransactionRepository } from '../../src/modules/transactions/transaction.repository.js'
import { RestaurantService } from '../../src/modules/restaurants/restaurant.service.js'
import { RestaurantController } from '../../src/modules/restaurants/restaurant.controller.js'
import { TransactionService } from '../../src/modules/transactions/transaction.service.js'
import { TransactionController } from '../../src/modules/transactions/transaction.controller.js'

describe('Auth Endpoints (E2E)', () => {
  let app: Express
  let db: Database

  beforeAll(async () => {
    const authRepository = new AuthRepository()
    const transactionRepository = new TransactionRepository()
    const userRepository = new UserRepository()
    const authService = new AuthService(authRepository, transactionRepository, userRepository)
    const authController = new AuthController(authService)
    const restaurantService = new RestaurantService(transactionRepository)
    const restaurantController = new RestaurantController(restaurantService)
    const transactionService = new TransactionService(transactionRepository)
    const transactionController = new TransactionController(transactionService)

    app = createApi(
      authRepository,
      authController,
      restaurantController,
      transactionController
    )
    db = await conectDB()
  })

  // REGISTER
  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      name: 'Test User E2E Register',
      email: 'test.e2e.register@example.com',
      password: 'password123'
    }

    it('should register a new user successfully with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toEqual('User registered successfully')
      expect(response.body.userInfo).toBeDefined()
      expect(response.body.userInfo.email).toEqual(validUserData.email)
      expect(response.body.userInfo.name).toEqual(validUserData.name)
      expect(response.body.userInfo).toHaveProperty('id')
      expect(response.body.userInfo).not.toHaveProperty('password_hash')

      const userInDb = await db.get('SELECT id, email, name FROM users WHERE email = ?', validUserData.email)
      expect(userInDb).toBeDefined()
      expect(userInDb?.email).toEqual(validUserData.email)

      const transactionInDb = await db.get('SELECT type FROM transactions WHERE user_id = ? AND type = ?', [userInDb?.id, 'REGISTER'])
      expect(transactionInDb?.type).toEqual('REGISTER')
    })

    it('should return 409 Conflict if email already exists', async () => {
      await request(app).post('/api/v1/auth/register').send(validUserData)
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toEqual('An account with this email already exists')
    })

    it('should return 400 Bad Request for missing email', async () => {
      const invalidData = { name: 'Test', password: 'password123' }
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toEqual('Validation error')
      expect(response.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: ['body', 'email'], message: 'Email is required' })])
      )
    })

    it('should return 400 Bad Request for short password', async () => {
      const invalidData = { ...validUserData, password: '123' }
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: ['body', 'password'], message: 'Password must be at least 8 characters long' })])
      )
    })
  })

  // LOGIN
  describe('POST /api/v1/auth/login', () => {
    const loginUserCredentials = {
      name: 'Test Login User',
      email: 'test.login@example.com',
      password: 'password123'
    }

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(loginUserCredentials)
    })

    it('should login successfully and return token with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginUserCredentials.email,
          password: loginUserCredentials.password
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toEqual('Login successful')
      expect(response.body).toHaveProperty('userData')
      expect(response.body.userData).toHaveProperty('token')
      expect(typeof response.body.userData.token).toBe('string')
      expect(response.body.userData.token.length).toBeGreaterThan(10)
      expect(response.body.userData).toHaveProperty('user')
      expect(response.body.userData.user.email).toEqual(loginUserCredentials.email)
      expect(response.body.userData.user.name).toEqual(loginUserCredentials.name)
      expect(response.body.userData.user).toHaveProperty('id')
      expect(response.body.userData.user).not.toHaveProperty('password_hash')

      const userInDb = await db.get('SELECT id FROM users WHERE email = ?', loginUserCredentials.email)
      const transactionInDb = await db.get('SELECT type FROM transactions WHERE user_id = ? AND type = ?', [userInDb?.id, 'LOGIN'])
      expect(transactionInDb?.type).toEqual('LOGIN')
    })

    it('should return 401 Unauthorized for incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginUserCredentials.email,
          password: 'wrongPassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toEqual('Invalid email or passworrd')
      expect(response.body).not.toHaveProperty('userData')
    })

    it('should return 401 Unauthorized for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toEqual('Invalid email or passworrd')
      expect(response.body).not.toHaveProperty('userData')
    })

    it('should return 400 Bad Request if email is missing', async () => {
      const invalidData = { password: 'password123' }
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toEqual('Validation error')
      expect(response.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: ['body', 'email'], message: 'Email is required' })])
      )
    })

    it('should return 400 Bad Request if password is missing', async () => {
      const invalidData = { email: loginUserCredentials.email }
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: ['body', 'password'], message: 'Password is required' })])
      )
    })
  })

  // LOGOUT
  describe('POST /api/v1/auth/logout', () => {
    const logoutUserCredentials = {
      name: 'Test Logout User',
      email: 'test.logout@example.com',
      password: 'password123'
    }
    let userToken: string = ''

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(logoutUserCredentials)
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: logoutUserCredentials.email,
          password: logoutUserCredentials.password
        })
      // Asegura que token sea string o falle el test si no viene
      userToken = loginResponse.body.userData?.token ?? ''
      expect(userToken).not.toBe('')
    })

    it('should logout successfully with a valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', userToken)

      expect(response.status).toBe(201)
      expect(response.body.message).toEqual('Logout successfully')
    })

    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')

      expect(response.status).toBe(401)
      expect(response.body.message).toEqual('Unauthorized error, token is required')
    })

    it('should return 401 Unauthorized if token is invalid or malformed', async () => {
      const invalidToken = 'un-token-malo'
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', invalidToken)

      expect(response.status).toBe(401)
      expect(response.body.message).toBeDefined()
    })

    it('should prevent access to a protected route after logout', async () => {
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', userToken)
      expect(logoutResponse.status).toBe(201)

      const protectedResponse = await request(app)
        .get('/api/v1/restaurants')
        .set('Authorization', userToken)

      expect(protectedResponse.status).toBe(401)
      expect(protectedResponse.body.message).toEqual('This token is no longer valid')
    })
  })
})
