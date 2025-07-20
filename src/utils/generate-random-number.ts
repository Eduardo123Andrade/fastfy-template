export const generateRandomNumber = (maxQuantity: number, minimumQuantity = 1): number => {
  // Garante que as quantidades sejam números positivos
  if (maxQuantity <= 0 || minimumQuantity <= 0) return 0
  
  // Garante que minimumQuantity não seja maior que maxQuantity
  if (minimumQuantity > maxQuantity) {
    minimumQuantity = maxQuantity
  }

  // Calcula o limite mínimo e máximo
  const min = Math.pow(10, minimumQuantity - 1)
  const max = Math.pow(10, maxQuantity) - 1

  // Gera um número aleatório entre min e max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
