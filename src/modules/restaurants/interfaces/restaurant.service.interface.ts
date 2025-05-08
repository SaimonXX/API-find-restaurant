import { ISearchRestaurantsDto } from '../dto/SearchRestaurants.dto.js'
import { IRestaurantInfo } from '../restaurant.model.js'

export interface IRestaurantService {
  findNearby: (searchParams: ISearchRestaurantsDto, userId: number) => Promise<IRestaurantInfo[]>
}
