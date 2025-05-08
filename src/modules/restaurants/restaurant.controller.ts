import { NextFunction, Response } from 'express'
import { IRestaurantController } from './interfaces/restaurant.controller.interface.js'
import { IRestaurantService } from './interfaces/restaurant.service.interface.js'
import { ISearchRestaurantsDto } from './dto/SearchRestaurants.dto.js'
import { IRequestWithUser } from '../auth/interfaces/auth.controller.interface.js'
import { UnauthorizedError } from '@src/core/errors/UnauthorizedError.js'

class RestaurantController implements IRestaurantController {
  constructor (
    private readonly restaurantService: IRestaurantService
  ) {}

  async findNearby (req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as ISearchRestaurantsDto
      const userId = req.user?.userId
      if (userId == null) throw new UnauthorizedError('User id not found. Authentication is required')
      const result = await this.restaurantService.findNearby(params, userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

export { RestaurantController }
