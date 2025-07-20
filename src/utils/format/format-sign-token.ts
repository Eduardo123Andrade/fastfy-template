export const formatSignToken = (token: string) => {
  const [first, second, third] = token.split('.')
  return `${first}.${second}.${third}`
}
