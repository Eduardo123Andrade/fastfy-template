import { AuthService } from "../../src/services/auth/auth.service"
import {
  AuthRepository,
  UserRepository,
  ActiveUserRepository,
} from "../../src/repository"
import { sendActivationEmail } from "../../src/services/user-email.service"
import { BadRequestException } from "../../src/exceptions"
import { ENVIRONMENT } from "../../src/config"

// Mock dos repositórios
jest.mock("../../src/repository", () => ({
  AuthRepository: {
    saveValidToken: jest.fn(),
    findToken: jest.fn(),
  },
  UserRepository: {
    findByEmail: jest.fn(),
  },
  ActiveUserRepository: {
    createActiveUserToken: jest.fn(),
  },
}))

// Mock do serviço de email
jest.mock("../../src/services/user-email.service", () => ({
  sendActivationEmail: jest.fn().mockResolvedValue(true),
}))

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("generatePayload", () => {
    it("deve gerar um payload com o userId e data de expiração padrão", () => {
      // Arrange
      const userId = "user-id-123"
      const originalDate = Date

      // Mock Date constructor and Date.now
      const mockDate = new Date("2023-01-01T00:00:00.000Z")
      const mockTime = mockDate.getTime()

      global.Date = class extends Date {
        constructor() {
          super("2023-01-01T00:00:00.000Z")
        }
        static now() {
          return mockTime
        }
      } as DateConstructor

      // Act
      const payload = AuthService.generatePayload(userId)

      // Assert
      const expectedExpDate = new Date("2023-01-01T00:00:00.000Z")
      expectedExpDate.setDate(
        expectedExpDate.getDate() + ENVIRONMENT.JWT_ACCESS_EXPIRATION_DAYS
      )

      expect(payload).toEqual({
        userId,
        iat: mockTime,
        exp: expectedExpDate.getTime(),
      })

      // Restore original Date
      global.Date = originalDate
    })

    it("deve gerar um payload com o userId e data de expiração personalizada", () => {
      // Arrange
      const userId = "user-id-123"
      const customExpires = 30
      const originalDate = Date

      // Mock Date constructor and Date.now
      const mockDate = new Date("2023-01-01T00:00:00.000Z")
      const mockTime = mockDate.getTime()

      global.Date = class extends Date {
        constructor() {
          super("2023-01-01T00:00:00.000Z")
        }
        static now() {
          return mockTime
        }
      } as DateConstructor

      // Act
      const payload = AuthService.generatePayload(userId, customExpires)

      // Assert
      const expectedExpDate = new Date("2023-01-01T00:00:00.000Z")
      expectedExpDate.setDate(expectedExpDate.getDate() + customExpires)

      expect(payload).toEqual({
        userId,
        iat: mockTime,
        exp: expectedExpDate.getTime(),
      })

      // Restore original Date
      global.Date = originalDate
    })
  })

  describe("createToken", () => {
    it("deve criar um token válido com sucesso", async () => {
      // Arrange
      const token = "valid-token-123"
      const userId = "user-id-123"

      const expectedResult = {
        id: "token-id-123",
        token,
        userId,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(AuthRepository, "saveValidToken")
        .mockResolvedValue(expectedResult)

      // Act
      const result = await AuthService.createToken(token, userId)

      // Assert
      expect(AuthRepository.saveValidToken).toHaveBeenCalledWith(token, userId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe("validateToken", () => {
    it("deve validar um token com sucesso", async () => {
      // Arrange
      const token = "valid-token-123"
      const userId = "user-id-123"

      const expectedResult = {
        id: "token-id-123",
        token,
        userId,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(AuthRepository, "findToken").mockResolvedValue(expectedResult)

      // Act
      const result = await AuthService.validateToken(token, userId)

      // Assert
      expect(AuthRepository.findToken).toHaveBeenCalledWith(token, userId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe("resendActivationToken", () => {
    it("deve reenviar o token de ativação para um usuário inativo", async () => {
      // Arrange
      const email = "test@example.com"
      const mockUser = {
        id: "user-id-123",
        name: "Test User",
        email,
        password: "password123",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: { description: "INACTIVE" },
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockToken = {
        id: "token-id-123",
        token: "123456",
        userId: "user-id-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(UserRepository, "findByEmail").mockResolvedValue(mockUser)
      jest
        .spyOn(ActiveUserRepository, "createActiveUserToken")
        .mockResolvedValue(mockToken)

      // Act
      await AuthService.resendActivationToken(email)

      // Assert
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(ActiveUserRepository.createActiveUserToken).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(sendActivationEmail).toHaveBeenCalledWith({
        token: mockToken.token,
        userEmail: mockUser.email,
        userName: mockUser.name,
      })
    })

    it("deve lançar BadRequestException quando o usuário já está ativo", async () => {
      // Arrange
      const email = "active@example.com"
      const mockUser = {
        id: "user-id-123",
        name: "Active User",
        email,
        password: "password123",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: { description: "ACTIVE" },
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(UserRepository, "findByEmail").mockResolvedValue(mockUser)

      // Act & Assert
      await expect(AuthService.resendActivationToken(email)).rejects.toThrow(
        BadRequestException
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(ActiveUserRepository.createActiveUserToken).not.toHaveBeenCalled()
      expect(sendActivationEmail).not.toHaveBeenCalled()
    })

    it("deve propagar erros do repositório", async () => {
      // Arrange
      const email = "test@example.com"
      const error = new Error("Database error")

      jest.spyOn(UserRepository, "findByEmail").mockRejectedValue(error)

      // Act & Assert
      await expect(AuthService.resendActivationToken(email)).rejects.toThrow(
        "Database error"
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
    })
  })
})
