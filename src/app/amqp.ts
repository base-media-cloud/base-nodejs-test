import { ConsumeMessage } from 'amqplib'
import { iconikCustomActionUseCase } from 'src/use-cases/iconik-custom-action-use-case.js'
import {
  amqpChannel,
  FRAMEIO_WEBHOOK_QUEUE_NAME,
  ICONIK_CUSTOM_ACTION_QUEUE_NAME,
} from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'
import { frameioWebhookBodySchema } from 'src/utils/frameio-webhook-schema.js'
import { frameioMessageSyncUseCase } from 'src/use-cases/frameio-message-sync-use-case/index.js'
import { createWithBackoff } from 'src/utils/exponential-backoff.js'
import { RateLimitError } from 'src/errors/errors.js'

const withBackoff = createWithBackoff()

await amqpChannel.consume(ICONIK_CUSTOM_ACTION_QUEUE_NAME, async (message) => {
  if (!message) {
    return
  }
  try {
    await withBackoff(async () => {
      const payload = await iconikCustomActionPayloadSchema.validate(message?.content?.toString())
      await iconikCustomActionUseCase(payload)
    }, RateLimitError)

    amqpChannel.ack(message as ConsumeMessage)
  } catch (error: any) {
    console.error(error)
    amqpChannel.nack(message, false, false)
  }
})

await amqpChannel.consume(FRAMEIO_WEBHOOK_QUEUE_NAME, async (message) => {
  if (!message) {
    return
  }
  try {
    await withBackoff(async () => {
      const payload = await frameioWebhookBodySchema.validate(message?.content?.toString())
      await frameioMessageSyncUseCase(payload)
    }, RateLimitError)
    amqpChannel.ack(message as ConsumeMessage)
  } catch (error: any) {
    console.error(error)
    amqpChannel.nack(message, false, false)
  }
})
