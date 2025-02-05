import { assetCollection } from '../../utils/mongo-db.js'
import { iconikClient } from '../../utils/iconik-client.js'

type UpsertCommentInIconikParams = {
  frameIoCommentId: string,
  frameIoAssetId: string,
  commentText: string,
  frameIoParentCommentId?: string | undefined,
}
export async function upsertCommentInIconik({
  frameIoCommentId,
  frameIoAssetId,
  commentText,
  frameIoParentCommentId,
}: UpsertCommentInIconikParams) {
  const asset = await assetCollection.findOne({
    frameIoAssetId: frameIoAssetId,
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  const foundComment = asset.comments?.find(comment => comment.frameIoCommentId === frameIoCommentId)
  const foundParentComment = frameIoParentCommentId
    ? asset.comments?.find(comment => comment.frameIoCommentId === frameIoParentCommentId)
    : null;

  const iconicComment = {
    segment_type: 'COMMENT',
    segment_text: commentText,
    ...(foundParentComment?.iconikMessageId ? { parent_id: foundParentComment?.iconikMessageId } : {}),
  };

  if (foundComment) {
    return await iconikClient.put(
      `assets/v1/assets/${asset.iconikAssetId}/segments/${foundComment.iconikMessageId}`,
      iconicComment,
    )
  }

  const { data: createdComment } = await iconikClient.post(
    `assets/v1/assets/${asset.iconikAssetId}/segments`,
    iconicComment,
  )
  await assetCollection.updateOne(
    { _id: asset._id },
    { $push: { comments: { frameIoCommentId: frameIoCommentId, iconikMessageId: createdComment.id } } },
  )
}
