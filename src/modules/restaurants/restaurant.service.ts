import { envVars } from '@src/config/env.config.js'
import { ITransactionRepository } from '../transactions/interfaces/transaction.respository.interface.js'
import { ISearchRestaurantsDto } from './dto/SearchRestaurants.dto.js'
import { IRestaurantService } from './interfaces/restaurant.service.interface.js'
import { IGeoapifyGeocodeFeature, IGeoapifyPlaceFeature } from './interfaces/api.interface.js'
import { IRestaurantInfo } from './restaurant.model.js'
import { InternalServerError } from '@src/core/errors/InternalServerError.js'
import { BadRequestError } from '@src/core/errors/BadRequestError.js'
import { NotFoundError } from '@src/core/errors/NotFoundError.js'

class RestaurantService implements IRestaurantService {
  private readonly geoapifyApiKey: string
  private readonly geocodeUrl = 'https://api.geoapify.com/v1/geocode/search'
  private readonly placesUrl = 'https://api.geoapify.com/v2/places'
  constructor (
    private readonly transactionRepository: ITransactionRepository
  ) {
    this.geoapifyApiKey = envVars.GEOAPIFY_API_KEY
  }

  async findNearby (searchParams: ISearchRestaurantsDto, userId: number): Promise<IRestaurantInfo[]> {
    if (this.geoapifyApiKey == null) {
      throw new InternalServerError('There is not an Api Key.')
    }

    let latitude: number | undefined = searchParams.lat
    let longitude: number | undefined = searchParams.lon
    let locationUsedForSearch = ''

    if (latitude !== undefined && longitude !== undefined) {
      locationUsedForSearch = `coords:${latitude},${longitude}`
    } else if (searchParams.city != null) {
      const coords = await this.getCoordsForPlace(searchParams.city)

      if (coords != null) {
        latitude = coords.lat
        longitude = coords.lon
        locationUsedForSearch = `city:${searchParams.city} -> coords:${latitude},${longitude}`
      } else throw new NotFoundError('No coordinates could be found for that city')
    } else {
      throw new BadRequestError('Invalid search parameters')
    }

    const radiusMeters = 5000
    const limitResults = 20

    const placesParams = new URLSearchParams({
      categories: 'catering.restaurant',
      filter: `circle:${longitude},${latitude},${radiusMeters}`,
      bias: `proximity:${longitude},${latitude}`,
      limit: String(limitResults),
      apiKey: this.geoapifyApiKey
    })
    const placesUrlWithParams = `${this.placesUrl}?${placesParams.toString()}`

    let foundRestaurants: IRestaurantInfo[] = []

    const response = await fetch(placesUrlWithParams)
    if (!response.ok) {
      throw new InternalServerError('Error in external API')
    }

    const data = await response.json() as { features: IGeoapifyPlaceFeature[] }

    if (data?.features != null) {
      foundRestaurants = data.features
        .map(feature => ({
          name: feature.properties.name ?? 'Name not available',
          address: [feature.properties.address_line1, feature.properties.address_line2]
            .filter(Boolean)
            .join(', ') ?? 'Address not available'
          // latitude: feature.properties.lat,
          // longitude: feature.properties.lon,
        }))
    } else {
      throw new NotFoundError('Restaurants not found')
    }

    const transactionDetails = JSON.stringify({
      searchParams,
      locationUsed: locationUsedForSearch,
      resultsCount: foundRestaurants.length
    })

    await this.transactionRepository.createTransaction({
      user_id: userId,
      type: 'RESTAURANT_SEARCH',
      details: transactionDetails.substring(0, 1000)
    })

    return foundRestaurants
  }

  private async getCoordsForPlace (placeName: string): Promise<{ lat: number, lon: number } | null> {
    if (this.geoapifyApiKey == null) {
      return null
    }

    const params = new URLSearchParams({
      city: placeName,
      limit: '1',
      apiKey: this.geoapifyApiKey
    })
    const url = `${this.geocodeUrl}?${params.toString()}`

    try {
      const response = await fetch(url)
      if (!response.ok) return null
      const data = await response.json() as { features: IGeoapifyGeocodeFeature[] }
      if (data?.features?.length > 0 && data.features[0]?.properties != null) {
        const { lat, lon } = data.features[0].properties
        return { lat, lon }
      } else {
        return null
      }
    } catch (error: any) {
      return null
    }
  }
}

export { RestaurantService }
