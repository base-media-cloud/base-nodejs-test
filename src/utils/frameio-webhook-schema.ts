import {
  InferType,
  object,
  string,
  number,
} from 'yup'

export const frameioWebhookBodySchema = object({
  project: object({
    id: string().uuid().required(),
  }).required(),
  resource: object({
    id: string().uuid().required(),
    type: string().required(),
  }).required(),
  team: object({
    id: string().uuid().required(),
  }).required(),
  type: string().required(),
  user: object({
    id: string().uuid().required(),
  }).required(),
}).json()

export type FrameioWebhookBody = InferType<typeof frameioWebhookBodySchema>

export const frameioHeadersSchema = object({
  'x-frameio-signature': string().required(),
  'x-frameio-request-timestamp': number().required(),
})
