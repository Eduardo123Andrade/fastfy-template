import { ActiveUserRepository } from "../../src/repository/user/active-user.repository"
import { UserRepository } from "../../src/repository/user/user.repository"
import prisma from "../../src/lib/prisma"
import { NotFoundException } from "../../src/exceptions"
import { generateRandomNumber } from "../../src/utils/generate-random-number"

// Mock do Prisma
jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    activeUserToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

// Mock UserRepository
jest.mock("../../src/repository/user/user.repository", () => ({
  UserRepository: {
    findById: jest.fn(),
  },
}))

// Mock generateRandomNumber
jest.mock("../../src/utils/generate-random-number", () => ({
  generateRandomNumber: jest.fn(),
}))

describe("ActiveUserRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createActiveUserToken", () => {
    it("deve criar um token de ativação com sucesso", async () => {
      // Arrange
      const userId = "user-id-123"
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: "INACTIVE",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const randomNumber = 123456
      const token = "123456"

      const expectedToken = {
        id: "token-id",
        token,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(UserRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(generateRandomNumber, "mockReturnValue")(randomNumber)
      jest
        .spyOn(prisma.activeUserToken, "create")
        .mockResolvedValue(expectedToken)

      // Act
      const result = await ActiveUserRepository.createActiveUserToken(userId)

      // Assert
      expect(UserRepository.findById).toHaveBeenCalledWith(userId)
      expect(generateRandomNumber).toHaveBeenCalledWith(6)
      expect(prisma.activeUserToken.create).toHaveBeenCalledWith({
        data: {
          token,
          userId,
        },
      })
      expect(result).toEqual(expectedToken)
    })

    it("deve lidar com números menores que 6 dígitos", async () => {
      // Arrange
      const userId = "user-id-123"
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: "INACTIVE",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const randomNumber = 123 // Apenas 3 dígitos
      const paddedToken = "000123" // Deve adicionar zeros à esquerda

      const expectedToken = {
        id: "token-id",
        token: paddedToken,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(UserRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(generateRandomNumber, "mockReturnValue")(randomNumber)
      jest
        .spyOn(prisma.activeUserToken, "create")
        .mockResolvedValue(expectedToken)

      // Act
      const result = await ActiveUserRepository.createActiveUserToken(userId)

      // Assert
      expect(UserRepository.findById).toHaveBeenCalledWith(userId)
      expect(generateRandomNumber).toHaveBeenCalledWith(6)
      expect(prisma.activeUserToken.create).toHaveBeenCalledWith({
        data: {
          token: paddedToken,
          userId,
        },
      })
      expect(result).toEqual(expectedToken)
    })

    it("deve propagar erro quando o usuário não for encontrado", async () => {
      // Arrange
      const userId = "non-existent-id"
      const userError = new NotFoundException("Usuario não econtrado")

      jest.spyOn(UserRepository, "findById").mockRejectedValue(userError)

      // Act & Assert
      await expect(
        ActiveUserRepository.createActiveUserToken(userId)
      ).rejects.toThrow("Usuario não econtrado")
      expect(UserRepository.findById).toHaveBeenCalledWith(userId)
      expect(generateRandomNumber).not.toHaveBeenCalled()
      expect(prisma.activeUserToken.create).not.toHaveBeenCalled()
    })

    it("deve propagar erro ao criar o token", async () => {
      // Arrange
      const userId = "user-id-123"
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: "INACTIVE",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const randomNumber = 123456
      const token = "123456"
      const dbError = new Error("Database error")

      jest.spyOn(UserRepository, "findById").mockResolvedValue(mockUser)
      jest.spyOn(generateRandomNumber, "mockReturnValue")(randomNumber)
      jest.spyOn(prisma.activeUserToken, "create").mockRejectedValue(dbError)

      // Act & Assert
      await expect(
        ActiveUserRepository.createActiveUserToken(userId)
      ).rejects.toThrow("Database error")
      expect(UserRepository.findById).toHaveBeenCalledWith(userId)
      expect(generateRandomNumber).toHaveBeenCalledWith(6)
      expect(prisma.activeUserToken.create).toHaveBeenCalledWith({
        data: {
          token,
          userId,
        },
      })
    })
  })

  describe("existsToken", () => {
    it("deve retornar true quando o token existir", async () => {
      // Arrange
      const token = "123456"
      const userId = "user-id-123"

      const mockToken = {
        id: "token-id",
        token,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(prisma.activeUserToken, "findFirst")
        .mockResolvedValue(mockToken)

      // Act
      const result = await ActiveUserRepository.existsToken(token, userId)

      // Assert
      expect(prisma.activeUserToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
        },
      })
      expect(result).toBe(true)
    })

    it("deve lançar NotFoundException quando o token não existir", async () => {
      // Arrange
      const token = "invalid-token"
      const userId = "user-id-123"

      jest.spyOn(prisma.activeUserToken, "findFirst").mockResolvedValue(null)

      // Act & Assert
      await expect(
        ActiveUserRepository.existsToken(token, userId)
      ).rejects.toThrow(NotFoundException)
      await expect(
        ActiveUserRepository.existsToken(token, userId)
      ).rejects.toThrow("Token not found")
      expect(prisma.activeUserToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
        },
      })
    })

    it("deve propagar erros do banco de dados", async () => {
      // Arrange
      const token = "123456"
      const userId = "user-id-123"
      const dbError = new Error("Database connection error")

      jest.spyOn(prisma.activeUserToken, "findFirst").mockRejectedValue(dbError)

      // Act & Assert
      await expect(
        ActiveUserRepository.existsToken(token, userId)
      ).rejects.toThrow("Database connection error")
      expect(prisma.activeUserToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
        },
      })
    })
  })

  describe("findUserToken", () => {
    it("deve encontrar o token do usuário com sucesso", async () => {
      // Arrange
      const token = "123456"
      const userId = "user-id-123"

      const mockToken = {
        id: "token-id",
        token,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(prisma.activeUserToken, "findFirst")
        .mockResolvedValue(mockToken)

      // Act
      const result = await ActiveUserRepository.findUserToken(token, userId)

      // Assert
      expect(prisma.activeUserToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
        },
      })
      expect(result).toEqual(mockToken)
    })

    it("deve lançar NotFoundException quando o token não for encontrado", async () => {
      // Arrange
      const token = "invalid-token"
      const userId = "user-id-123"

      jest.spyOn(prisma.activeUserToken, "findFirst").mockResolvedValue(null)

      // Act & Assert
      await expect(
        ActiveUserRepository.findUserToken(token, userId)
      ).rejects.toThrow(NotFoundException)
      await expect(
        ActiveUserRepository.findUserToken(token, userId)
      ).rejects.toThrow("Token not found")
      expect(prisma.activeUserToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
        },
      })
    })

    it("deve propagar erros do banco de dados", async () => {
      // Arrange
      const token = "123456"
      const userId = "user-id-123"
      const dbError = new Error("Database connection error")

      jest.spyOn(prisma.activeUserToken, "findFirst").mockRejectedValue(dbError)

      // Act & Assert
      await expect(
        ActiveUserRepository.findUserToken(token, userId)
      ).rejects.toThrow("Database connection error")
      expect(prisma.activeUserToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
        },
      })
    })
  })
})
