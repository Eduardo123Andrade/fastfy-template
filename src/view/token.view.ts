import { SessionTokenDTO } from '@/interfaces'

const cleanToken = (data: SessionTokenDTO) => {
  const { token } = data
  return token
}

export const TokenView = {
  cleanToken,
}
