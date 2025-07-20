import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify"
import { AuthController } from "../../src/controllers/auth.controller"
import { AuthService, UserService } from "../../src/services"
import { HttpStatusCode } from "../../src/utils"
import * as validations from "../../src/validations"
import { UserView, TokenView } from "../../src/view"
import { BadRequestException } from "../../src/exceptions"

// Mock dos serviços
jest.mock("../../src/services", () => ({
  AuthService: {
    generatePayload: jest.fn(),
    createToken: jest.fn(),
    resendActivationToken: jest.fn(),
  },
  UserService: {
    create: jest.fn(),
    login: jest.fn(),
  },
}))

// Mock das views
jest.mock("../../src/view", () => ({
  UserView: {
    createUserView: jest.fn(),
  },
  TokenView: {
    cleanToken: jest.fn(),
  },
}))

// Mock das validações
jest.mock("../../src/validations")

describe("AuthController", () => {
  let mockRequest: Partial<FastifyRequest>
  let mockReply: Partial<FastifyReply>
  let mockApp: Partial<FastifyInstance>

  beforeEach(() => {
    mockRequest = {
      body: {},
    }

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setCookie: jest.fn().mockReturnThis(),
    }

    mockApp = {
      jwt: {
        sign: jest.fn().mockReturnValue("jwt-token"),
      },
    }

    jest.clearAllMocks()

    // Configuração padrão para as validações
    jest
      .spyOn(validations, "validateCreateUserSchemaBody")
      .mockImplementation((data) => data)
    jest
      .spyOn(validations, "validateLoginUserSchemaBody")
      .mockImplementation((data) => data)
    jest
      .spyOn(validations, "validateResendActivationTokenSchemaBody")
      .mockImplementation((data) => data)
  })

  describe("signUp", () => {
    it("deve criar um usuário com sucesso", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date("1990-01-01"),
      }

      const createdUser = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: { description: "INACTIVE" },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const userView = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: "INACTIVE",
        birthdate: new Date("1990-01-01"),
      }

      mockRequest.body = userData

      jest.spyOn(UserService, "create").mockResolvedValue(createdUser)
      jest.spyOn(UserView, "createUserView").mockReturnValue(userView)

      // Act
      await AuthController.signUp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )

      // Assert
      expect(validations.validateCreateUserSchemaBody).toHaveBeenCalledWith(
        userData
      )
      expect(UserService.create).toHaveBeenCalledWith(userData)
      expect(UserView.createUserView).toHaveBeenCalledWith(createdUser)
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.CREATED)
      expect(mockReply.send).toHaveBeenCalledWith({ user: userView })
    })

    it("deve lidar com erro de validação", async () => {
      // Arrange
      const invalidUserData = {
        email: "invalid-email",
        name: "",
        password: "123",
        confirmPassword: "456",
      }

      mockRequest.body = invalidUserData

      const validationError = new Error("Erro de validação")
      jest
        .spyOn(validations, "validateCreateUserSchemaBody")
        .mockImplementation(() => {
          throw validationError
        })

      // Act & Assert
      await expect(
        AuthController.signUp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Erro de validação")
      expect(UserService.create).not.toHaveBeenCalled()
    })

    it("deve lidar com erro do serviço", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date("1990-01-01"),
      }

      mockRequest.body = userData

      const serviceError = new Error("Erro ao criar usuário")
      jest.spyOn(UserService, "create").mockRejectedValue(serviceError)

      // Act & Assert
      await expect(
        AuthController.signUp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Erro ao criar usuário")
      expect(UserService.create).toHaveBeenCalledWith(userData)
      expect(UserView.createUserView).not.toHaveBeenCalled()
    })
  })

  describe("login", () => {
    it("deve fazer login com sucesso", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "Password123!",
      }

      const user = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: { description: "ACTIVE" },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const userView = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: "ACTIVE",
        birthdate: new Date("1990-01-01"),
      }

      const payload = {
        userId: user.id,
        iat: Date.now(),
        exp: Date.now() + 86400000,
      }

      const sessionToken = {
        id: "token-id-123",
        token: "jwt-token",
        userId: user.id,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.body = loginData

      jest.spyOn(UserService, "login").mockResolvedValue(user)
      jest.spyOn(AuthService, "generatePayload").mockReturnValue(payload)
      jest.spyOn(AuthService, "createToken").mockResolvedValue(sessionToken)
      jest.spyOn(UserView, "createUserView").mockReturnValue(userView)
      jest.spyOn(TokenView, "cleanToken").mockReturnValue(sessionToken.token)

      // Act
      await AuthController.login(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
        mockApp as FastifyInstance
      )

      // Assert
      expect(validations.validateLoginUserSchemaBody).toHaveBeenCalledWith(
        loginData
      )
      expect(UserService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      )
      expect(AuthService.generatePayload).toHaveBeenCalledWith(user.id)
      expect(mockApp.jwt.sign).toHaveBeenCalledWith(payload, { sub: user.id })
      expect(AuthService.createToken).toHaveBeenCalledWith("jwt-token", user.id)
      expect(UserView.createUserView).toHaveBeenCalledWith(user)
      expect(TokenView.cleanToken).toHaveBeenCalledWith(sessionToken)
      expect(mockReply.setCookie).toHaveBeenCalledWith(
        "auth_token",
        sessionToken.token,
        expect.objectContaining({
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          signed: true,
        })
      )
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.OK)
      expect(mockReply.send).toHaveBeenCalledWith({ user: userView })
    })

    it("deve lidar com erro de validação", async () => {
      // Arrange
      const invalidLoginData = {
        email: "invalid-email",
        password: "",
      }

      mockRequest.body = invalidLoginData

      const validationError = new Error("Erro de validação")
      jest
        .spyOn(validations, "validateLoginUserSchemaBody")
        .mockImplementation(() => {
          throw validationError
        })

      // Act & Assert
      await expect(
        AuthController.login(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
          mockApp as FastifyInstance
        )
      ).rejects.toThrow("Erro de validação")
      expect(UserService.login).not.toHaveBeenCalled()
    })

    it("deve lidar com erro de credenciais inválidas", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "WrongPassword",
      }

      mockRequest.body = loginData

      const authError = new Error("Credenciais inválidas")
      jest.spyOn(UserService, "login").mockRejectedValue(authError)

      // Act & Assert
      await expect(
        AuthController.login(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
          mockApp as FastifyInstance
        )
      ).rejects.toThrow("Credenciais inválidas")
      expect(UserService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      )
      expect(AuthService.generatePayload).not.toHaveBeenCalled()
    })

    it("deve lidar com erro ao criar token de sessão", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "Password123!",
      }

      const user = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: { description: "ACTIVE" },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const payload = {
        userId: user.id,
        iat: Date.now(),
        exp: Date.now() + 86400000,
      }

      mockRequest.body = loginData

      jest.spyOn(UserService, "login").mockResolvedValue(user)
      jest.spyOn(AuthService, "generatePayload").mockReturnValue(payload)

      const tokenError = new Error("Erro ao criar token")
      jest.spyOn(AuthService, "createToken").mockRejectedValue(tokenError)

      // Act & Assert
      await expect(
        AuthController.login(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
          mockApp as FastifyInstance
        )
      ).rejects.toThrow("Erro ao criar token")
      expect(UserService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      )
      expect(AuthService.generatePayload).toHaveBeenCalledWith(user.id)
      expect(mockApp.jwt.sign).toHaveBeenCalledWith(payload, { sub: user.id })
      expect(AuthService.createToken).toHaveBeenCalledWith("jwt-token", user.id)
      expect(UserView.createUserView).not.toHaveBeenCalled()
    })
  })

  describe("resendActiveToken", () => {
    it("deve reenviar o token de ativação com sucesso", async () => {
      // Arrange
      const requestData = {
        email: "test@example.com",
      }

      mockRequest.body = requestData

      // Act
      await AuthController.resendActiveToken(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )

      // Assert
      expect(
        validations.validateResendActivationTokenSchemaBody
      ).toHaveBeenCalledWith(requestData)
      expect(AuthService.resendActivationToken).toHaveBeenCalledWith(
        requestData.email
      )
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.OK)
      expect(mockReply.send).toHaveBeenCalled()
    })

    it("deve lidar com erro de validação", async () => {
      // Arrange
      const invalidData = {
        email: "invalid-email",
      }

      mockRequest.body = invalidData

      const validationError = new Error("Erro de validação")
      jest
        .spyOn(validations, "validateResendActivationTokenSchemaBody")
        .mockImplementation(() => {
          throw validationError
        })

      // Act & Assert
      await expect(
        AuthController.resendActiveToken(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Erro de validação")
      expect(AuthService.resendActivationToken).not.toHaveBeenCalled()
    })

    it("deve lidar com erro quando o usuário já está ativo", async () => {
      // Arrange
      const requestData = {
        email: "active@example.com",
      }

      mockRequest.body = requestData

      const activeError = new BadRequestException("Usuário já está ativo")
      jest
        .spyOn(AuthService, "resendActivationToken")
        .mockRejectedValue(activeError)

      // Act & Assert
      await expect(
        AuthController.resendActiveToken(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Usuário já está ativo")
      expect(AuthService.resendActivationToken).toHaveBeenCalledWith(
        requestData.email
      )
    })
  })

  describe("validateToken", () => {
    it("deve validar o token com sucesso", async () => {
      // Act
      await AuthController.validateToken(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.OK)
      expect(mockReply.send).toHaveBeenCalled()
    })
  })
})
