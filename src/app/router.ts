import express from 'express'
import { ICONIK_CUSTOM_ACTION_URL_PATH } from 'src/config/iconik-custom-action.js'
import {
  amqpChannel,
  FRAMEIO_WEBHOOK_MESSAGE_TYPE,
  FRAMEIO_WEBHOOK_TOPIC_NAME,
  ICONIK_CUSTOM_ACTION_MESSAGE_TYPE,
  ICONIK_CUSTOM_ACTION_TOPIC_NAME,
} from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'
import { FRAMEIO_WEBHOOK_URL_PATH, FRAME_IO_WEBHOOK_SECRET } from 'src/config/frameio-webhook.js'
import { verifySignature } from 'src/utils/hmac.js'
import { frameioHeadersSchema, frameioWebhookBodySchema } from 'src/utils/frameio-webhook-schema.js'

export const apiRouter = express.Router()

apiRouter.post(ICONIK_CUSTOM_ACTION_URL_PATH, async (req, res) => {
  console.log('Received custom action request')
  const payload = await iconikCustomActionPayloadSchema.validate(req.body)
  amqpChannel.publish(ICONIK_CUSTOM_ACTION_TOPIC_NAME, ICONIK_CUSTOM_ACTION_MESSAGE_TYPE, Buffer.from(JSON.stringify(payload)))
  res.status(202).json({ status: 'Accepted' })
})

apiRouter.post(FRAMEIO_WEBHOOK_URL_PATH, async (req, res) => {
  const headers = await frameioHeadersSchema.validate({
    'X-Frameio-Signature': req.get('X-Frameio-Signature'),
    'X-Frameio-Request-Timestamp': req.get('X-Frameio-Request-Timestamp'),
  })
  const payload = await frameioWebhookBodySchema.validate(req.body)

  const valid = verifySignature({
    signature: headers['X-Frameio-Signature'],
    secret: FRAME_IO_WEBHOOK_SECRET,
    timestamp: headers['X-Frameio-Request-Timestamp'],
    payload: JSON.stringify(payload),
  })

  if (!valid) {
    res.status(401).json({ status: 'Unauthorized' })
    return
  }

  amqpChannel.publish(FRAMEIO_WEBHOOK_TOPIC_NAME, FRAMEIO_WEBHOOK_MESSAGE_TYPE, Buffer.from(JSON.stringify(payload)))

  res.status(202).json({ status: 'Accepted' })
})
