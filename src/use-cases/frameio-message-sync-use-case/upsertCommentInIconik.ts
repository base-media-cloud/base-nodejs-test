import { assetCollection } from '../../utils/mongo-db.js'
import { iconikClient } from '../../utils/iconik-client.js'

export async function upsertCommentInIconik(frameIoCommentId: string, frameIoAssetId: string, commentText: string) {
  const asset = await assetCollection.findOne({
    frameIoAssetId: frameIoAssetId,
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  const foundComment = asset.comments?.find(comment => comment.frameIoCommentId === frameIoCommentId)
  if (foundComment) {
    return await iconikClient.put(`assets/v1/assets/${asset.iconikAssetId}/segments/${foundComment.iconikMessageId}`, {
      segment_type: 'COMMENT',
      segment_text: commentText,
    })
  }

  const { data: createdComment } = await iconikClient.post(`assets/v1/assets/${asset.iconikAssetId}/segments`, {
    segment_type: 'COMMENT',
    segment_text: commentText,
  })
  await assetCollection.updateOne(
    { _id: asset._id },
    { $push: { comments: { frameIoCommentId: frameIoCommentId, iconikMessageId: createdComment.id } } },
  )
}
