import { generateRandomNumber } from '../../src/utils/generate-random-number'

describe('generateRandomNumber', () => {
  it('deve retornar 0 quando maxQuantity for 0', () => {
    // Act
    const result = generateRandomNumber(0)
    
    // Assert
    expect(result).toBe(0)
  })

  it('deve retornar 0 quando maxQuantity for negativa', () => {
    // Act
    const result = generateRandomNumber(-5)
    
    // Assert
    expect(result).toBe(0)
  })

  it('deve retornar 0 quando minimumQuantity for 0', () => {
    // Act
    const result = generateRandomNumber(5, 0)
    
    // Assert
    expect(result).toBe(0)
  })

  it('deve retornar 0 quando minimumQuantity for negativa', () => {
    // Act
    const result = generateRandomNumber(5, -3)
    
    // Assert
    expect(result).toBe(0)
  })

  it('deve usar maxQuantity quando minimumQuantity for maior que maxQuantity', () => {
    // Act
    const result = generateRandomNumber(3, 5)
    
    // Assert
    expect(result).toBeGreaterThanOrEqual(100)
    expect(result).toBeLessThanOrEqual(999)
    expect(result.toString().length).toBe(3)
  })

  it('deve gerar um número com 1 dígito quando maxQuantity = 1', () => {
    // Act
    const result = generateRandomNumber(1)
    
    // Assert
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(9)
    expect(result.toString().length).toBe(1)
  })

  it('deve gerar um número com 1 a 3 dígitos quando maxQuantity = 3', () => {
    // Act
    const result = generateRandomNumber(3)
    
    // Assert
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(999)
    expect(result.toString().length).toBeGreaterThanOrEqual(1)
    expect(result.toString().length).toBeLessThanOrEqual(3)
  })

  it('deve gerar um número com exatamente 3 dígitos quando maxQuantity = 3 e minimumQuantity = 3', () => {
    // Act
    const result = generateRandomNumber(3, 3)
    
    // Assert
    expect(result).toBeGreaterThanOrEqual(100)
    expect(result).toBeLessThanOrEqual(999)
    expect(result.toString().length).toBe(3)
  })

  it('deve gerar um número com 4 a 6 dígitos quando maxQuantity = 6 e minimumQuantity = 4', () => {
    // Act
    const result = generateRandomNumber(6, 4)
    
    // Assert
    expect(result).toBeGreaterThanOrEqual(1000)
    expect(result).toBeLessThanOrEqual(999999)
    expect(result.toString().length).toBeGreaterThanOrEqual(4)
    expect(result.toString().length).toBeLessThanOrEqual(6)
  })

  it('deve gerar números diferentes em chamadas consecutivas', () => {
    // Act
    const results = new Set()
    for (let i = 0; i < 10; i++) {
      results.add(generateRandomNumber(4, 4))
    }
    
    // Assert
    // Se todos os números forem diferentes, o Set terá 10 elementos
    // Há uma chance muito pequena de colisão, mas é improvável com 10 chamadas
    expect(results.size).toBeGreaterThan(1)
  })
})