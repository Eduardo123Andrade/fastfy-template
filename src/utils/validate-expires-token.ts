export const isActiveTokenExpired = (expiresAt: Date) => {
  const timeLifeActiveUserToken = 15
  const date = new Date(expiresAt)
  const now = new Date()

  date.setSeconds(0)
  date.setMilliseconds(0)

  now.setMinutes(now.getMinutes() - timeLifeActiveUserToken)
  now.setSeconds(0)
  now.setMilliseconds(0)

  const diff = now.getTime() - date.getTime()

  const diffInMinutes = Math.floor(diff / 1000 / 60)

  return diffInMinutes > 0
}
