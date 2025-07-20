import { Signer } from '@fastify/cookie'

export const validateTokenCookie = (token: string) => {
  const signer = new Signer('secret')
  const signedValue = signer.sign(token)
  const { valid } = signer.unsign(signedValue)
  return valid
}
