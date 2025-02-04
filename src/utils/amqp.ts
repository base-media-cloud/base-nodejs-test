import amqplib from 'amqplib'

import { AMQP_URL } from 'src/config/env-vars.js'

export const ICONIK_CUSTOM_ACTION_TOPIC_NAME = 'iconik-custom-action'
export const ICONIK_CUSTOM_ACTION_MESSAGE_TYPE = 'custom-action'
export const ICONIK_CUSTOM_ACTION_QUEUE_NAME = 'custom-action.queue'

export const FRAMEIO_WEBHOOK_TOPIC_NAME = 'frameio-webhook'
export const FRAMEIO_WEBHOOK_MESSAGE_TYPE = 'frameio-webhook'
export const FRAMEIO_WEBHOOK_QUEUE_NAME = 'frameio-webhook.queue'

const connection = await amqplib.connect(AMQP_URL)
export const amqpChannel = await connection.createChannel()

await amqpChannel.assertExchange(ICONIK_CUSTOM_ACTION_TOPIC_NAME, 'topic')
await amqpChannel.assertQueue(ICONIK_CUSTOM_ACTION_QUEUE_NAME)
await amqpChannel.bindQueue(ICONIK_CUSTOM_ACTION_QUEUE_NAME, ICONIK_CUSTOM_ACTION_TOPIC_NAME, ICONIK_CUSTOM_ACTION_MESSAGE_TYPE)

await amqpChannel.assertExchange(FRAMEIO_WEBHOOK_TOPIC_NAME, 'topic')
await amqpChannel.assertQueue(FRAMEIO_WEBHOOK_QUEUE_NAME)
await amqpChannel.bindQueue(FRAMEIO_WEBHOOK_QUEUE_NAME, FRAMEIO_WEBHOOK_TOPIC_NAME, FRAMEIO_WEBHOOK_MESSAGE_TYPE)
