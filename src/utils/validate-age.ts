export const isOlder = (birthDate: Date) => {
  const today = new Date()

  if (today.getFullYear() - birthDate.getFullYear() <= 17) return false

  if (today.getFullYear() - birthDate.getFullYear() > 18) return true

  if (today.getMonth() > birthDate.getMonth()) return true

  if (today.getDate() >= birthDate.getDate()) return true

  return false
}
