import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { AuthRepository } from '../../src/modules/auth/auth.respository.js'
import { AuthService } from '../../src/modules/auth/auth.service.js'
import { UserRepository } from '../../src/modules/users/user.repository.js'
import { TransactionRepository } from '../../src/modules/transactions/transaction.repository.js'
import { RestaurantService } from '../../src/modules/restaurants/restaurant.service.js'
import { RestaurantController } from '../../src/modules/restaurants/restaurant.controller.js'
import { createRestaurantRouter } from '../../src/modules/restaurants/restaurant.route.js'
import { errorHandler } from '../../src/core/middleware/errorHandler.middleware.js'

let fetchSpy: any

const fusagasugaCoords = { lat: 4.33646, lon: -74.36378 }
const mockRestaurantFeatures = [
  { properties: { name: 'EL PEON RESTAURANTE & COMIDAS RAPIDAS', address_line1: 'EL PEON RESTAURANTE & COMIDAS RAPIDAS' } },
  { properties: { name: 'El Brasero', address_line1: 'El Brasero' } }
]
type MockResponseData = Partial<Pick<Response, 'ok' | 'status' | 'statusText' | 'json' | 'text'>>

describe('Restaurants Endpoints (E2E)', () => {
  let app: Express
  let authToken = ''
  let testUserId: number = 0
  let authService: AuthService

  beforeAll(async () => {
    fetchSpy = jest.spyOn(global, 'fetch')

    const authRepository = new AuthRepository()
    const transactionRepository = new TransactionRepository()
    const userRepository = new UserRepository()
    const restaurantService = new RestaurantService(transactionRepository)
    const restaurantController = new RestaurantController(restaurantService)
    authService = new AuthService(authRepository, transactionRepository, userRepository)

    app = express()
    app.use(express.json())
    const restaurantRouter = createRestaurantRouter(authRepository, restaurantController)
    app.use('/api/v1/restaurants', restaurantRouter)
    app.use(errorHandler)

    const testUser = { name: 'Restaurant Tester Fusa', email: `restaurant.fusa.${Date.now()}@example.com`, password: 'password123' }
    const registeredUser = await authService.registerUser(testUser)
    const loginData = await authService.loginUser({ email: testUser.email, password: testUser.password })
    authToken = loginData.token
    testUserId = registeredUser.id

    if (typeof authToken !== 'string' || authToken === '' || typeof testUserId !== 'number' || testUserId === 0) {
      throw new Error('Failed to get valid auth token or user ID in simplified beforeAll.')
    }
  })

  afterAll(() => {
    if (fetchSpy != null) { fetchSpy.mockRestore() }
  })

  beforeEach(async () => {
    if (fetchSpy != null) {
      fetchSpy.mockClear()
      fetchSpy.mockImplementation(async (url): Promise<MockResponseData> => {
        const urlString = String(url)
        const isGeocode = urlString.includes('/v1/geocode')
        const isPlaces = urlString.includes('/v2/places')
        if (isGeocode) {
          return { ok: true, status: 200, json: async () => ({ features: [{ properties: fusagasugaCoords }] }) }
        }
        if (isPlaces) {
          return { ok: true, status: 200, json: async () => ({ features: mockRestaurantFeatures }) }
        }
        throw new Error(`Unexpected fetch call: ${urlString}`)
      })
    }
    const testUser = { name: 'Restaurant Tester', email: `restaurant.tester.${Date.now()}@example.com`, password: 'password123' }
    const registeredUser = await authService.registerUser(testUser)
    const loginData = await authService.loginUser({ email: testUser.email, password: testUser.password })
    authToken = loginData.token
    testUserId = registeredUser.id
    if (typeof authToken !== 'string' || authToken === '' || typeof testUserId !== 'number' || testUserId === 0) {
      throw new Error('Failed to get valid auth token or user ID in beforeEach.')
    }
  })

  describe('GET /api/v1/restaurants', () => {
    it('should FAIL if no token is provided (401)', async () => {
      const response = await request(app).get('/api/v1/restaurants?city=Fusagasuga')
      expect(response.status).toBe(401)
      expect(response.body.message).toEqual('Unauthorized error, token is required')
    })

    it('should PASS when searching by valid city (Fusagasuga)', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants?city=Fusagasuga')
        .set('Authorization', authToken)
      expect(response.status).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toEqual(mockRestaurantFeatures.length)
      expect(response.body[0]?.name).toEqual(mockRestaurantFeatures[0].properties.name)
    })

    it('should PASS when searching by valid coordinates (Fusagasuga)', async () => {
      const lat = fusagasugaCoords.lat
      const lon = fusagasugaCoords.lon
      const response = await request(app)
        .get(`/api/v1/restaurants?lat=${lat}&lon=${lon}`)
        .set('Authorization', authToken)
      expect(response.status).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toEqual(mockRestaurantFeatures.length)
    })

    it('should FAIL if no city or coordinates are provided (400)', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .set('Authorization', authToken)
      expect(response.status).toBe(400)
      expect(response.body.message).toEqual('Validation error')
    })

    it('should FAIL if only lat (or lon) is provided (400)', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants?lat=4.33646')
        .set('Authorization', authToken)
      expect(response.status).toBe(400)
      expect(response.body.message).toEqual('Validation error')
    })

    it('should FAIL if city coordinates cannot be found (404 - Service Behavior)', async () => {
      fetchSpy.mockImplementation(async (url): Promise<MockResponseData> => {
        if (String(url).includes('/v1/geocode')) {
          return { ok: true, status: 200, json: async () => ({ features: [] }) }
        }
        throw new Error(`Unexpected fetch call: ${String(url)}`)
      })
      const response = await request(app)
        .get('/api/v1/restaurants?city=CiudadInexistente')
        .set('Authorization', authToken)
      expect(response.status).toBe(404)
      expect(response.body.message).toEqual('No coordinates could be found for that city')
    })

    it('should FAIL if Geoapify Places API errors (500 - Service Behavior)', async () => {
      fetchSpy.mockImplementation(async (url): Promise<MockResponseData> => {
        const urlString = String(url)
        if (urlString.includes('/v1/geocode')) {
          return { ok: true, status: 200, json: async () => ({ features: [{ properties: fusagasugaCoords }] }) }
        }
        if (urlString.includes('/v2/places')) {
          return { ok: false, status: 503, statusText: 'Service Unavailable' }
        }
        throw new Error(`Unexpected fetch call: ${String(url)}`)
      })
      const response = await request(app)
        .get('/api/v1/restaurants?city=Fusagasuga')
        .set('Authorization', authToken)
      expect(response.status).toBe(500)
      expect(response.body.message).toEqual('Error in external API')
    })
  })
})
