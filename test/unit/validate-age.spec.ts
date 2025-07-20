import { isOlder } from '../../src/utils/validate-age'

describe('isOlder', () => {
  // Mock da data atual para tornar os testes determinísticos
  const mockDate = new Date(2023, 5, 15) // 15 de junho de 2023

  beforeAll(() => {
    // Mock da função Date para retornar sempre a mesma data
    const originalDate = global.Date
    jest.spyOn(global, 'Date').mockImplementation(function (...args) {
      return args.length ? new originalDate(...args) : mockDate
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('deve retornar true para pessoas com mais de 18 anos', () => {
    // Arrange
    const birthDate = new Date(2000, 5, 15) // 15 de junho de 2000 (23 anos)

    // Act
    const result = isOlder(birthDate)

    // Assert
    expect(result).toBe(true)
  })

  it('deve retornar false para pessoas com menos de 18 anos', () => {
    // Arrange
    const birthDate = new Date(2012, 5, 15) // 15 de junho de 2012 (11 anos)

    // Act
    const result = isOlder(birthDate)

    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar true para pessoas que completaram 18 anos hoje', () => {
    // Arrange
    const birthDate = new Date(2005, 5, 15) // 15 de junho de 2005 (18 anos exatos)

    // Act
    const result = isOlder(birthDate)

    // Assert
    expect(result).toBe(true)
  })

  it('deve retornar false para pessoas que completarão 18 anos amanhã', () => {
    // Arrange
    const birthDate = new Date(2005, 5, 16) // 16 de junho de 2005 (1 dia para 18 anos)
    // Act
    const result = isOlder(birthDate)

    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar true para pessoas que completaram 18 anos ontem', () => {
    // Arrange
    const birthDate = new Date(2005, 5, 14) // 14 de junho de 2005 (18 anos e 1 dia)

    // Act
    const result = isOlder(birthDate)

    // Assert
    expect(result).toBe(true)
  })

  it('deve retornar true para pessoas que completaram 18 anos no mês passado', () => {
    // Arrange
    const birthDate = new Date(2005, 4, 15) // 15 de maio de 2005 (18 anos e 1 mês)

    // Act
    const result = isOlder(birthDate)

    // Assert
    expect(result).toBe(true)
  })
})
