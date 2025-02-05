import express from 'express'
import { ICONIK_CUSTOM_ACTION_URL_PATH, ICONIK_CUSTOM_ACTION_TOKEN } from 'src/config/iconik-custom-action.js'
import {
  amqpChannel,
  FRAMEIO_WEBHOOK_MESSAGE_TYPE,
  FRAMEIO_WEBHOOK_TOPIC_NAME,
  ICONIK_CUSTOM_ACTION_MESSAGE_TYPE,
  ICONIK_CUSTOM_ACTION_TOPIC_NAME,
} from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'
import { FRAMEIO_WEBHOOK_URL_PATH, FRAME_IO_WEBHOOK_SECRET } from 'src/config/frameio-webhook.js'
import { frameioHeadersSchema, frameioWebhookBodySchema } from 'src/utils/frameio-webhook-schema.js'
import { frameIoSignatureMiddleware } from 'src/utils/frame-io-signature-middleware.js'
import { body, headers } from 'src/utils/validator-middleware.js'
import {
  iconikCustomActionTokenValidationMiddleware
} from '../utils/iconik-custom-action-token-validation-middleware.js'

export const apiRouter = express.Router()

apiRouter.post(
  ICONIK_CUSTOM_ACTION_URL_PATH,
  body(iconikCustomActionPayloadSchema),
  iconikCustomActionTokenValidationMiddleware(ICONIK_CUSTOM_ACTION_TOKEN),
  async (req, res) => {
    amqpChannel.publish(ICONIK_CUSTOM_ACTION_TOPIC_NAME, ICONIK_CUSTOM_ACTION_MESSAGE_TYPE, Buffer.from(JSON.stringify(req.body)))

    res.status(202).json({ status: 'Accepted' })
  }
)

apiRouter.post(
  FRAMEIO_WEBHOOK_URL_PATH,
  body(frameioWebhookBodySchema),
  headers(frameioHeadersSchema),
  frameIoSignatureMiddleware(FRAME_IO_WEBHOOK_SECRET),
  async (req, res) => {
    amqpChannel.publish(FRAMEIO_WEBHOOK_TOPIC_NAME, FRAMEIO_WEBHOOK_MESSAGE_TYPE, Buffer.from(JSON.stringify(req.body)))

    res.status(202).json({ status: 'Accepted' })
  }
)
