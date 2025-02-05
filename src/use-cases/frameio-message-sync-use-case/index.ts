import { AxiosError } from 'axios'
import { frameIoClient } from 'src/utils/frame-io-client.js'
import { deleteCommentInIconik } from './delete-comment-in-iconik.js'
import { upsertCommentInIconik } from './upsert-comment-in-iconik.js'

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
  const parentCommentData = commentData?.parent_id ? await fetchCommentData(commentData.parent_id) : null

  if (!commentData) {
    await deleteCommentInIconik(payload.resource.id)
    return;
  }

  if (parentCommentData) {
    await upsertCommentInIconik({
      frameIoCommentId: parentCommentData.id,
      frameIoAssetId: parentCommentData.asset_id,
      commentText: parentCommentData.text,
    });
  }
  await upsertCommentInIconik({
    frameIoCommentId: commentData.id,
    frameIoAssetId: commentData.asset_id,
    commentText: commentData.text,
    frameIoParentCommentId: parentCommentData?.id,
  });
}
