import { describe, expect, it } from 'vitest'
import crypto from 'crypto'
import { verifySignature } from './hmac.js'

const secret = 'cWWLtWRfRLraXwP'
const payload = 'lorem ipsum sint nobis autem dolore eos consequatur. Veniam qui consequatur fugit at dolor eaque soluta. Repellendus et tenetur aut ab.'

describe('verifySignature', () => {
  it('returns true for valid signature', () => {
    const timestamp = new Date().getTime() / 1000
    const testSignature = crypto.createHmac('sha256', secret).update(`v0:${timestamp}:${payload}`).digest('hex')

    expect(verifySignature({
      signature: `v0=${testSignature}`,
      secret,
      timestamp,
      payload,
    })).toBe(true)
  })

  it('returns false for invalid signature calculated from incorrect secret', () => {
    const timestamp = new Date().getTime() / 1000
    const testSignature = crypto.createHmac('sha256', 'wrong secret').update(`v0:${timestamp}:${payload}`).digest('hex')

    expect(verifySignature({
      signature: `v0=${testSignature}`,
      secret,
      timestamp,
      payload,
    })).toBe(false)
  })

  it('returns false for invalid signature calculated from modified payload', () => {
    const timestamp = new Date().getTime() / 1000
    const testSignature = crypto.createHmac('sha256', secret).update(`v0:${timestamp}:${payload}`).digest('hex')

    expect(verifySignature({
      signature: `v0=${testSignature}`,
      secret,
      timestamp,
      payload: 'some other payload',
    })).toBe(false)
  })

  it('returns false for expired timestamp', () => {
    const timestamp = new Date().getTime() / 1000 - 10 * 60
    const testSignature = crypto.createHmac('sha256', secret).update(`v0:${timestamp}:${payload}`).digest('hex')

    expect(verifySignature({
      signature: `v0=${testSignature}`,
      secret,
      timestamp,
      payload,
    })).toBe(false)
  })
})
