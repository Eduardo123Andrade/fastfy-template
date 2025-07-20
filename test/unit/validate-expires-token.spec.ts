// test/unit/validate-expires-token.spec.ts

import { isActiveTokenExpired } from '../../src/utils/validate-expires-token'

describe('isActiveTokenExpired', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('deve retornar true quando o token expirou (mais de 15 minutos)', () => {
    // Arrange
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMinutes(expiresAt.getMinutes() - 20) // Token criado 20 minutos atrás

    // Act
    const result = isActiveTokenExpired(expiresAt)

    // Assert
    expect(result).toBe(true)
  })

  it('deve retornar false quando o token ainda é válido (menos de 15 minutos)', () => {
    // Arrange
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMinutes(expiresAt.getMinutes() - 10) // Token criado 10 minutos atrás

    // Act
    const result = isActiveTokenExpired(expiresAt)

    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar false quando o token foi criado exatamente há 15 minutos', () => {
    // Arrange
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMinutes(expiresAt.getMinutes() - 15) // Token criado exatamente 15 minutos atrás

    // Act
    const result = isActiveTokenExpired(expiresAt)

    // Assert
    expect(result).toBe(false)
  })

  it('deve ignorar segundos e milissegundos na comparação', () => {
    // Arrange
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMinutes(expiresAt.getMinutes() - 16) // Token criado 16 minutos atrás
    expiresAt.setSeconds(30)
    expiresAt.setMilliseconds(500)

    // Act
    const result = isActiveTokenExpired(expiresAt)

    // Assert
    expect(result).toBe(true)
  })
})
