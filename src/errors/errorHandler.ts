import type { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'yup'
import { UnauthorizedError } from './errors.js'

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(error)
  if (error instanceof ValidationError) {
    res.status(400).json({
      message: 'Bad request',
    })
    return
  }
  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      message: 'Unauthorized',
    })
    return
  }

  res.status(500).json({
    message: 'Internal server error',
  })
}
