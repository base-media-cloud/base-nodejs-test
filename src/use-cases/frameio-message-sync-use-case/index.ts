import { AxiosError } from 'axios'
import { frameIoClient } from 'src/utils/frame-io-client.js'
import { deleteCommentInIconik } from './deleteCommentInIconik.js'
import { upsertCommentInIconik } from './upsertCommentInIconik.js'

import type { FrameioWebhookBody } from 'src/utils/frameio-webhook-schema.js'


async function fetchCommentData(commentId: string) {
  try {
    const { data: commentData } = await frameIoClient.get(`/comments/${commentId}`)
    return commentData
  } catch (error: AxiosError | unknown) {
    if (
      error instanceof AxiosError
        && error.response?.status === 404
        && error.response.data.errors.find((error: any) => error?.detail === 'Could not find the requested resource')
    ) {
      return null
    }
    throw error
  }
}

export async function frameioMessageSyncUseCase(payload: FrameioWebhookBody) {
  const commentData = await fetchCommentData(payload.resource.id)

  if (commentData) {
    await upsertCommentInIconik(commentData.id, commentData.asset_id, commentData.text)
  } else {
    await deleteCommentInIconik(payload.resource.id)
  }


}
