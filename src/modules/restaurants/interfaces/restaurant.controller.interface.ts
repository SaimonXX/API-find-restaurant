import { NextFunction, Request, Response } from 'express'

interface IRestaurantController {
  findNearby: (req: Request, res: Response, next: NextFunction) => Promise<void>
}

export { IRestaurantController }
