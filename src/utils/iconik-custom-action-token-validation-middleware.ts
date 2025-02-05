import { UnauthorizedError } from 'src/errors/errors.js'

import type { NextFunction, Request, Response } from 'express'

export const iconikCustomActionTokenValidationMiddleware = (token: string) =>
  (req: Request, res: Response, next: NextFunction)=> {
    const valid = req.get('Authorization') === token

    if (!valid) {
      next(new UnauthorizedError('Invalid signature'))
      return
    }

    next()
  }
