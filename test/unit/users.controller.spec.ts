import { FastifyReply, FastifyRequest } from "fastify"
import { UsersController } from "../../src/controllers/users.controller"
import { UserService } from "../../src/services"
import { HttpStatusCode } from "../../src/utils"
import * as validations from "../../src/validations"

// Mock do serviço
jest.mock("../../src/services", () => ({
  UserService: {
    activeUser: jest.fn(),
  },
}))

// Mock das validações
jest.mock("../../src/validations", () => ({
  validateActiveUserSchemaBody: jest.fn(),
}))

// Mock HttpStatusCode
jest.mock("../../src/utils", () => ({
  HttpStatusCode: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
  },
}))

describe("UsersController", () => {
  let mockRequest: Partial<FastifyRequest>
  let mockReply: Partial<FastifyReply>

  beforeEach(() => {
    mockRequest = {
      body: {},
    }

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }

    jest.clearAllMocks()
  })

  describe("activeUser", () => {
    it("deve ativar um usuário com sucesso", async () => {
      // Arrange
      const activeUserData = {
        email: "test@example.com",
        token: "123456",
      }

      const userData = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: {
          description: "ACTIVE",
        },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.body = activeUserData

      validations.validateActiveUserSchemaBody.mockReturnValue(activeUserData)
      UserService.activeUser.mockResolvedValue(userData)

      // Act
      await UsersController.activeUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )

      // Assert
      expect(validations.validateActiveUserSchemaBody).toHaveBeenCalledWith(
        activeUserData
      )
      expect(UserService.activeUser).toHaveBeenCalledWith(
        activeUserData.email,
        activeUserData.token
      )
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.OK)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Usuário ativado com sucesso!",
      })
    })

    it("deve lidar com erro de validação", async () => {
      // Arrange
      const invalidUserData = {
        email: "invalid-email",
        token: "", // Token vazio
      }

      mockRequest.body = invalidUserData

      const validationError = new Error("Erro de validação")
      validations.validateActiveUserSchemaBody.mockImplementation(() => {
        throw validationError
      })

      // Act & Assert
      await expect(
        UsersController.activeUser(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Erro de validação")
      expect(UserService.activeUser).not.toHaveBeenCalled()
    })

    it("deve lidar com erro de token expirado", async () => {
      // Arrange
      const activeUserData = {
        email: "test@example.com",
        token: "123456",
      }

      mockRequest.body = activeUserData

      const tokenError = new Error("Token expirado")
      validations.validateActiveUserSchemaBody.mockReturnValue(activeUserData)
      UserService.activeUser.mockRejectedValue(tokenError)

      // Act & Assert
      await expect(
        UsersController.activeUser(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Token expirado")
      expect(validations.validateActiveUserSchemaBody).toHaveBeenCalledWith(
        activeUserData
      )
      expect(UserService.activeUser).toHaveBeenCalledWith(
        activeUserData.email,
        activeUserData.token
      )
    })

    it("deve lidar com erro de usuário não encontrado", async () => {
      // Arrange
      const activeUserData = {
        email: "nonexistent@example.com",
        token: "123456",
      }

      mockRequest.body = activeUserData

      const notFoundError = new Error("Usuario não econtrado")
      validations.validateActiveUserSchemaBody.mockReturnValue(activeUserData)
      UserService.activeUser.mockRejectedValue(notFoundError)

      // Act & Assert
      await expect(
        UsersController.activeUser(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Usuario não econtrado")
      expect(validations.validateActiveUserSchemaBody).toHaveBeenCalledWith(
        activeUserData
      )
      expect(UserService.activeUser).toHaveBeenCalledWith(
        activeUserData.email,
        activeUserData.token
      )
    })
  })
})
