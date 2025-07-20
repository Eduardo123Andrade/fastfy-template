import { ActiveUSerSchema } from "../../../src/schemas/users/active-user.schema"
import { z } from "zod"

describe("ActiveUSerSchema", () => {
  it("deve validar dados de ativação de usuário válidos", () => {
    // Arrange
    const validData = {
      email: "test@example.com",
      token: "ABC123",
    }

    // Act
    const result = ActiveUSerSchema.safeParse(validData)

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it("deve rejeitar email inválido", () => {
    // Arrange
    const invalidData = {
      email: "invalid-email",
      token: "ABC123",
    }

    // Act
    const result = ActiveUSerSchema.safeParse(invalidData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email inválido")
    }
  })

  it("deve rejeitar token ausente", () => {
    // Arrange
    const invalidData = {
      email: "test@example.com",
    }

    // Act
    const result = ActiveUSerSchema.safeParse(invalidData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("invalid_type")
    }
  })

  it("deve rejeitar token com comprimento incorreto", () => {
    // Arrange
    const invalidData = {
      email: "test@example.com",
      token: "12345", // Menos de 6 caracteres
    }

    // Act
    const result = ActiveUSerSchema.safeParse(invalidData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("too_small")
    }
  })

  it("deve rejeitar token vazio", () => {
    // Arrange
    const invalidData = {
      email: "test@example.com",
      token: "",
    }

    // Act
    const result = ActiveUSerSchema.safeParse(invalidData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("too_small")
    }
  })

  it("deve rejeitar token numérico", () => {
    // Arrange
    const invalidData = {
      email: "test@example.com",
      token: 123456, // Passing a number instead of a string
    }

    // Act
    const result = ActiveUSerSchema.safeParse(invalidData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("invalid_type")
    }
  })

  it("deve rejeitar dados de entrada vazios", () => {
    // Arrange
    const emptyData = {}

    // Act
    const result = ActiveUSerSchema.safeParse(emptyData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })

  it("deve rejeitar dados de entrada nulos", () => {
    // Arrange
    const nullData = null

    // Act
    const result = ActiveUSerSchema.safeParse(nullData)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("invalid_type")
    }
  })
})
