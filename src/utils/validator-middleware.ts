import type { NextFunction, Request, Response } from 'express'
import type { Schema, ValidationError } from 'yup'

export const body = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body)
      next()
    } catch (error: ValidationError | unknown) {
      next(error)
    }
  }
}

export const headers = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.headers)
      next()
    } catch (error: ValidationError | unknown) {
      next(error)
    }
  }
}
