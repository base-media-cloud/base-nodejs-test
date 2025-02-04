import crypto from 'crypto'

type VerifySignatureParams = {
  signature: string,
  secret: string,
  timestamp: number,
  payload: string,
}
export const verifySignature = ({
  signature,
  secret,
  timestamp,
  payload,
}: VerifySignatureParams) => {
  const expired = (new Date().getTime() / 1000 - timestamp) > 5 * 60
  const hmac = crypto.createHmac('sha256', secret)
  const signatureToCompare = hmac.update(`v0:${timestamp}:${payload}`).digest('hex')

  return !expired && signature === `v0=${signatureToCompare}`
}
