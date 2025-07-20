import { encoder } from "../../src/utils/encoder"
import bcrypt from "bcrypt"

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe("encoder", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("codify", () => {
    it("deve codificar uma senha corretamente", async () => {
      // Arrange
      const password = "senha123"
      const hashedPassword = "hashed_password_123"
      bcrypt.hash.mockResolvedValue(hashedPassword)

      // Act
      const result = await encoder.codify(password)

      // Assert
      expect(result).toBe(hashedPassword)
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
    })

    it("deve propagar erros do bcrypt.hash", async () => {
      // Arrange
      const password = "senha123"
      const error = new Error("Erro de hash")
      bcrypt.hash.mockRejectedValue(error)

      // Act & Assert
      await expect(encoder.codify(password)).rejects.toThrow("Erro de hash")
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
    })
  })

  describe("verifyPassword", () => {
    it("deve verificar senha correta", async () => {
      // Arrange
      const password = "senha123"
      const hashedPassword = "hashed_password_123"
      bcrypt.compare.mockResolvedValue(true)

      // Act
      const result = await encoder.verifyPassword(password, hashedPassword)

      // Assert
      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
    })

    it("deve verificar senha incorreta", async () => {
      // Arrange
      const password = "senha_errada"
      const hashedPassword = "hashed_password_123"
      bcrypt.compare.mockResolvedValue(false)

      // Act
      const result = await encoder.verifyPassword(password, hashedPassword)

      // Assert
      expect(result).toBe(false)
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
    })

    it("deve propagar erros do bcrypt.compare", async () => {
      // Arrange
      const password = "senha123"
      const hashedPassword = "hashed_password_123"
      const error = new Error("Erro de comparação")
      bcrypt.compare.mockRejectedValue(error)

      // Act & Assert
      await expect(
        encoder.verifyPassword(password, hashedPassword)
      ).rejects.toThrow("Erro de comparação")
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
    })
  })
})
