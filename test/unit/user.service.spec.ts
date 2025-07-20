import { BadRequestException } from "../../src/exceptions"
import { CreateUserDto } from "../../src/interfaces/user.interface"
import { ActiveUserRepository, UserRepository } from "../../src/repository"
import { sendActivationEmail } from "../../src/services/user-email.service"
import { UserService } from "../../src/services/user/user.service"
import { encoder, isActiveTokenExpired, HttpStatusCode } from "../../src/utils"
import { isOlder } from "../../src/utils/validate-age"

// Mock dos repositórios
jest.mock("../../src/repository", () => ({
  UserRepository: {
    create: jest.fn(),
    findByEmail: jest.fn(),
    activeUser: jest.fn(),
  },
  ActiveUserRepository: {
    findUserToken: jest.fn(),
  },
}))

// Mock do encoder e utils
jest.mock("../../src/utils", () => ({
  encoder: {
    codify: jest.fn(),
    verifyPassword: jest.fn(),
  },
  isActiveTokenExpired: jest.fn(),
  HttpStatusCode: {
    BAD_REQUEST: 400,
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    CONFLICT: 409,
  },
}))

// Mock validate-age
jest.mock("../../src/utils/validate-age", () => ({
  isOlder: jest.fn(),
}))

// Mock sendActivationEmail
jest.mock("../../src/services/user-email.service", () => ({
  sendActivationEmail: jest.fn(),
}))

// Mock BadRequestException
jest.mock("../../src/exceptions", () => {
  const originalModule = jest.requireActual("../../src/exceptions")
  return {
    ...originalModule,
    BadRequestException: jest.fn().mockImplementation((message) => {
      return new Error(message)
    }),
  }
})

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("deve criar um usuário com sucesso", async () => {
      // Arrange
      const birthdate = new Date("1990-01-01")
      const userData: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate,
      }

      const hashedPassword = "hashed_password"
      const expectedUser = {
        id: "1",
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        cpf: userData.cpf,
        phone: userData.phone,
        birthdate: userData.birthdate,
        status: {
          id: "inactive-status-id",
          description: "INACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        statusId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockToken = {
        id: "token-id",
        token: "123456",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      isOlder.mockReturnValue(true)
      encoder.codify.mockResolvedValue(hashedPassword)
      UserRepository.create.mockResolvedValue({
        user: expectedUser,
        token: mockToken,
      })
      sendActivationEmail.mockResolvedValue(true)

      // Act
      const result = await UserService.create(userData)

      // Assert
      expect(isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).toHaveBeenCalledWith(userData.password)
      expect(UserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      })
      expect(sendActivationEmail).toHaveBeenCalledWith({
        token: mockToken.token,
        userEmail: expectedUser.email,
        userName: expectedUser.name,
      })
      expect(result).toEqual(expectedUser)
    })

    it("deve lançar erro quando usuário for menor de idade", async () => {
      // Arrange
      const birthdate = new Date("2010-01-01")
      const userData: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate,
      }

      isOlder.mockReturnValue(false)

      // Act & Assert
      await expect(UserService.create(userData)).rejects.toThrow(
        "Você precisa ter mais de 18 anos para se cadastrar"
      )
      expect(isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).not.toHaveBeenCalled()
      expect(UserRepository.create).not.toHaveBeenCalled()
      expect(sendActivationEmail).not.toHaveBeenCalled()
    })

    it("deve lançar erro quando o repositório falhar ao criar usuário", async () => {
      // Arrange
      const birthdate = new Date("1990-01-01")
      const userData: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate,
      }

      const hashedPassword = "hashed_password"
      const errorMessage = "User already exists"
      const repositoryError = new Error(errorMessage)

      isOlder.mockReturnValue(true)
      encoder.codify.mockResolvedValue(hashedPassword)
      UserRepository.create.mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(UserService.create(userData)).rejects.toThrow(errorMessage)
      expect(isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).toHaveBeenCalledWith(userData.password)
      expect(UserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      })
      expect(sendActivationEmail).not.toHaveBeenCalled()
    })
  })

  describe("activeUser", () => {
    it("deve ativar um usuário com sucesso", async () => {
      // Arrange
      const email = "test@example.com"
      const token = "123456"
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
        status: {
          description: "INACTIVE",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const tokenData = {
        id: "token-id",
        token: "123456",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const activatedUser = {
        ...mockUser,
        status: {
          description: "ACTIVE",
        },
      }

      UserRepository.findByEmail.mockResolvedValue(mockUser)
      ActiveUserRepository.findUserToken.mockResolvedValue(tokenData)
      isActiveTokenExpired.mockReturnValue(false)
      UserRepository.activeUser.mockResolvedValue(activatedUser)

      // Act
      const result = await UserService.activeUser(email, token)

      // Assert
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(ActiveUserRepository.findUserToken).toHaveBeenCalledWith(
        token,
        mockUser.id
      )
      expect(isActiveTokenExpired).toHaveBeenCalledWith(tokenData.createdAt)
      expect(UserRepository.activeUser).toHaveBeenCalledWith(
        mockUser.cpf,
        token
      )
      expect(result).toEqual(activatedUser)
    })

    it("deve lançar erro quando o token estiver expirado", async () => {
      // Arrange
      const email = "test@example.com"
      const token = "123456"
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
        status: {
          description: "INACTIVE",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const tokenData = {
        id: "token-id",
        token: "123456",
        userId: "1",
        createdAt: new Date("2020-01-01"), // Data antiga
        updatedAt: new Date(),
      }

      UserRepository.findByEmail.mockResolvedValue(mockUser)
      ActiveUserRepository.findUserToken.mockResolvedValue(tokenData)
      isActiveTokenExpired.mockReturnValue(true)

      // Act & Assert
      await expect(UserService.activeUser(email, token)).rejects.toThrow(
        "Token expirado"
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(ActiveUserRepository.findUserToken).toHaveBeenCalledWith(
        token,
        mockUser.id
      )
      expect(isActiveTokenExpired).toHaveBeenCalledWith(tokenData.createdAt)
      expect(UserRepository.activeUser).not.toHaveBeenCalled()
    })

    it("deve lançar erro quando o usuário não for encontrado", async () => {
      // Arrange
      const email = "nonexistent@example.com"
      const token = "123456"
      const errorMessage = "Usuario não econtrado"
      const notFoundError = new Error(errorMessage)

      UserRepository.findByEmail.mockRejectedValue(notFoundError)

      // Act & Assert
      await expect(UserService.activeUser(email, token)).rejects.toThrow(
        errorMessage
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(ActiveUserRepository.findUserToken).not.toHaveBeenCalled()
      expect(isActiveTokenExpired).not.toHaveBeenCalled()
      expect(UserRepository.activeUser).not.toHaveBeenCalled()
    })
  })

  describe("login", () => {
    it("deve fazer login com sucesso", async () => {
      // Arrange
      const email = "test@example.com"
      const password = "Password123!"
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
        status: {
          description: "ACTIVE",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      UserRepository.findByEmail.mockResolvedValue(mockUser)
      encoder.verifyPassword.mockResolvedValue(true)

      // Act
      const result = await UserService.login(email, password)

      // Assert
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(encoder.verifyPassword).toHaveBeenCalledWith(
        password,
        mockUser.password
      )
      expect(result).toEqual(mockUser)
    })

    it("deve lançar erro quando a senha for inválida", async () => {
      // Arrange
      const email = "test@example.com"
      const password = "WrongPassword"
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
        status: {
          description: "ACTIVE",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      UserRepository.findByEmail.mockResolvedValue(mockUser)
      encoder.verifyPassword.mockResolvedValue(false)

      // Act & Assert
      await expect(UserService.login(email, password)).rejects.toThrow(
        "Senha inválida"
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(encoder.verifyPassword).toHaveBeenCalledWith(
        password,
        mockUser.password
      )
    })

    it("deve lançar erro quando o usuário estiver inativo", async () => {
      // Arrange
      const email = "inactive@example.com"
      const password = "Password123!"
      const mockUser = {
        id: "1",
        email: "inactive@example.com",
        name: "Inactive User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
        status: {
          description: "INACTIVE",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      UserRepository.findByEmail.mockResolvedValue(mockUser)
      encoder.verifyPassword.mockResolvedValue(true)

      // Act & Assert
      await expect(UserService.login(email, password)).rejects.toThrow(
        "Usuário inativo"
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(encoder.verifyPassword).toHaveBeenCalledWith(
        password,
        mockUser.password
      )
    })

    it("deve lançar erro quando o usuário não for encontrado", async () => {
      // Arrange
      const email = "nonexistent@example.com"
      const password = "Password123!"
      const errorMessage = "Usuario não econtrado"
      const notFoundError = new Error(errorMessage)

      UserRepository.findByEmail.mockRejectedValue(notFoundError)

      // Act & Assert
      await expect(UserService.login(email, password)).rejects.toThrow(
        errorMessage
      )
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(encoder.verifyPassword).not.toHaveBeenCalled()
    })
  })
})
