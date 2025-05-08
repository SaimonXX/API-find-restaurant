// src/modules/restaurants/dto/SearchRestaurants.dto.ts
import { z } from 'zod'

const CoordinatesSchema = z.object({
  lat: z.preprocess(
    (data) => {
      if (data == null) return undefined
      const parsed = parseFloat(String(data))
      return parsed
    },
    z.number({ invalid_type_error: 'Latitude must be a number' })
      .min(-90)
      .max(90)
  ).optional(),

  lon: z.preprocess(
    (data) => {
      if (data == null) return undefined
      const parsed = parseFloat(String(data))
      return parsed
    },
    z.number({ invalid_type_error: 'Latitude must be a number' })
      .min(-90)
      .max(90)
  ).optional()
})

const CitySchema = z.object({
  city: z.string().trim().min(1).optional()
})

const searchRestaurantsSchema = z.object({
  query: CitySchema.merge(CoordinatesSchema)
    .refine(data => {
      const hasCoords = data.lat !== undefined && data.lon !== undefined
      const hasCity = data.city !== undefined && data.city.length > 0
      return hasCoords || hasCity
    }, {
      message: 'Debes proporcionar "city" o ambas "lat" y "lon" como query parameters',
      path: ['query']
    })
    .refine(data => {
      if (data.lat !== undefined || data.lon !== undefined) {
        return data.lat !== undefined && data.lon !== undefined
      }
      return true
    }, {
      message: 'Si proporcionas coordenadas, debes incluir tanto "lat" como "lon"',
      path: ['query']
    })
})

type ISearchRestaurantsDto = z.infer<typeof searchRestaurantsSchema>['query']

export { searchRestaurantsSchema, ISearchRestaurantsDto }
