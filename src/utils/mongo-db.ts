import { MongoClient } from 'mongodb'
import { MONGO_URI } from 'src/config/env-vars'

export const mongoDb = await MongoClient.connect(MONGO_URI)
export const db = mongoDb.db('base-nodejs-test')

export type AssetComment = {
  frameIoCommentId: string,
  iconikMessageId: string,
}
export type Asset = {
  frameIoAssetId: string,
  iconikAssetId: string,
  comments?: AssetComment[],
}
export const assetCollection = db.collection<Asset>('assets')
