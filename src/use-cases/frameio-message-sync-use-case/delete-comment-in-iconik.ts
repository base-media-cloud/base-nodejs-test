import { assetCollection } from 'src/utils/mongo-db.js'
import { iconikClient } from 'src/utils/iconik-client.js'

export async function deleteCommentInIconik(frameIoCommentId: string) {
  const asset = await assetCollection.findOne({
    comments: {
      $elemMatch: {
        frameIoCommentId,
      },
    },
  })

  if (asset) {
    const foundComment = asset.comments?.find(comment => comment.frameIoCommentId === frameIoCommentId)
    if (!foundComment) {
      throw new Error('Comment not found in mongo')
    }
    await iconikClient.delete(`assets/v1/assets/${asset.iconikAssetId}/segments/${foundComment.iconikMessageId}`)
    await assetCollection.updateOne(
      { _id: asset._id },
      { $pull: { comments: { frameIoCommentId } } },
    )
  }
}
