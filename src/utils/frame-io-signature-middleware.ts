import { verifySignature } from './hmac.js'
import { UnauthorizedError } from 'src/errors/errors.js'

import type { NextFunction, Request, Response } from 'express'

export const frameIoSignatureMiddleware = (secret: string) =>
  (req: Request, res: Response, next: NextFunction)=> {
    const valid = verifySignature({
      signature: req.get('X-Frameio-Signature') ?? '',
      secret,
      timestamp: Number(req.get('X-Frameio-Request-Timestamp')) ?? 0,
      payload: JSON.stringify(req.body),
    })

    if (!valid) {
      next(new UnauthorizedError('Invalid signature'))
      return
    }

    next()
  }
