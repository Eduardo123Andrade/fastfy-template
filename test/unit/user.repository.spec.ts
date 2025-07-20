import { UserRepository } from "../../src/repository/user/user.repository"
import prisma from "../../src/lib/prisma"
import { CreateUserDto, UserDto } from "../../src/interfaces/user.interface"
import { ConflictException, NotFoundException } from "../../src/exceptions"
import { ActiveUserRepository } from "../../src/repository/user/active-user.repository"
import { UserStatusRepository } from "../../src/repository/user/user-status.repository"
import { UserStatus } from "../../src/utils/constants/status/user-status"

// Mock do Prisma
jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userStatus: {
      findFirst: jest.fn(),
    },
    activeUserToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

// Mock ActiveUserRepository
jest.mock("../../src/repository/user/active-user.repository", () => ({
  ActiveUserRepository: {
    createActiveUserToken: jest.fn(),
    existsToken: jest.fn(),
  },
}))

// Mock UserStatusRepository
jest.mock("../../src/repository/user/user-status.repository", () => ({
  UserStatusRepository: {
    getStatusByDescription: jest.fn(),
  },
}))

describe("UserRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    jest
      .spyOn(ActiveUserRepository, "createActiveUserToken")
      .mockResolvedValue({
        id: "token-id",
        token: "123456",
        userId: "user-id-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    jest.spyOn(ActiveUserRepository, "existsToken").mockResolvedValue(true)
  })

  describe("create", () => {
    it("deve criar um usuário com sucesso", async () => {
      // Arrange
      const userData: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
      }

      const mockStatus = {
        id: "status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const expectedUser = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        statusId: "status-id",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(UserStatusRepository, "getStatusByDescription")
        .mockResolvedValue(mockStatus)
      jest.spyOn(prisma.user, "create").mockResolvedValue(expectedUser)

      // Act
      const result = await UserRepository.create(userData)

      // Assert
      expect(UserStatusRepository.getStatusByDescription).toHaveBeenCalledWith(
        UserStatus.INACTIVE
      )
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          name: "Test User",
          password: "Password123!",
          cpf: "123.456.789-00",
          phone: "(11) 99999-9999",
          statusId: "status-id",
          birthdate: expect.any(Date),
        },
      })
      expect(ActiveUserRepository.createActiveUserToken).toHaveBeenCalledWith(
        expectedUser.id
      )
      expect(result).toEqual({
        user: {
          ...expectedUser,
          status: mockStatus,
        },
        token: {
          id: "token-id",
          token: "123456",
          userId: "user-id-123",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
    })

    it("deve lançar ConflictException quando o usuário já existe", async () => {
      // Arrange
      const userData: CreateUserDto = {
        email: "existing@example.com",
        name: "Existing User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
      }

      const mockStatus = {
        id: "status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const prismaError: Error & { code?: string } = new Error(
        "Unique constraint failed"
      )
      prismaError.code = "P2002"

      jest
        .spyOn(UserStatusRepository, "getStatusByDescription")
        .mockResolvedValue(mockStatus)
      jest.spyOn(prisma.user, "create").mockRejectedValue(prismaError)

      // Act & Assert
      await expect(UserRepository.create(userData)).rejects.toThrow(
        ConflictException
      )
      await expect(UserRepository.create(userData)).rejects.toThrow(
        "User already exists"
      )
      expect(UserStatusRepository.getStatusByDescription).toHaveBeenCalledWith(
        UserStatus.INACTIVE
      )
    })

    it("deve propagar outros erros durante a criação do usuário", async () => {
      // Arrange
      const userData: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthdate: new Date(),
      }

      const mockStatus = {
        id: "status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const unexpectedError = new Error("Database connection failed")

      jest
        .spyOn(UserStatusRepository, "getStatusByDescription")
        .mockResolvedValue(mockStatus)
      jest.spyOn(prisma.user, "create").mockRejectedValue(unexpectedError)

      // Act & Assert
      await expect(UserRepository.create(userData)).rejects.toThrow(
        "Database connection failed"
      )
      expect(UserStatusRepository.getStatusByDescription).toHaveBeenCalledWith(
        UserStatus.INACTIVE
      )
    })
  })

  describe("findById", () => {
    it("deve encontrar um usuário pelo ID com sucesso", async () => {
      // Arrange
      const userId = "user-id-123"
      const mockStatus = {
        id: "status-id",
        description: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        statusId: "status-id",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: mockStatus,
      }

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)

      // Act
      const result = await UserRepository.findById(userId)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { status: true },
      })
      expect(result).toEqual({
        ...mockUser,
        status: UserStatus.ACTIVE,
      })
    })

    it("deve lançar NotFoundException quando o usuário não for encontrado pelo ID", async () => {
      // Arrange
      const userId = "non-existent-id"

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null)

      // Act & Assert
      await expect(UserRepository.findById(userId)).rejects.toThrow(
        NotFoundException
      )
      await expect(UserRepository.findById(userId)).rejects.toThrow(
        "Usuario não econtrado"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { status: true },
      })
    })
  })

  describe("findByCpf", () => {
    it("deve encontrar um usuário pelo CPF com sucesso", async () => {
      // Arrange
      const userCpf = "123.456.789-00"
      const mockStatus = {
        id: "status-id",
        description: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: userCpf,
        phone: "(11) 99999-9999",
        statusId: "status-id",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: mockStatus,
      }

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)

      // Act
      const result = await UserRepository.findByCpf(userCpf)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(result).toEqual({
        ...mockUser,
        status: UserStatus.ACTIVE,
      })
    })

    it("deve lançar NotFoundException quando o usuário não for encontrado pelo CPF", async () => {
      // Arrange
      const userCpf = "non-existent-cpf"

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null)

      // Act & Assert
      await expect(UserRepository.findByCpf(userCpf)).rejects.toThrow(
        NotFoundException
      )
      await expect(UserRepository.findByCpf(userCpf)).rejects.toThrow(
        "Usuario não econtrado"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
    })
  })

  describe("findByEmail", () => {
    it("deve encontrar um usuário pelo email com sucesso", async () => {
      // Arrange
      const userEmail = "test@example.com"
      const mockStatus = {
        id: "status-id",
        description: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: "user-id-123",
        email: userEmail,
        name: "Test User",
        password: "Password123!",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        statusId: "status-id",
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: mockStatus,
      }

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)

      // Act
      const result = await UserRepository.findByEmail(userEmail)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
        include: { status: true },
      })
      expect(result).toEqual(mockUser)
    })

    it("deve lançar NotFoundException quando o usuário não for encontrado pelo email", async () => {
      // Arrange
      const userEmail = "non-existent@example.com"

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null)

      // Act & Assert
      await expect(UserRepository.findByEmail(userEmail)).rejects.toThrow(
        NotFoundException
      )
      await expect(UserRepository.findByEmail(userEmail)).rejects.toThrow(
        "Usuario não econtrado"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
        include: { status: true },
      })
    })
  })

  describe("activeUser", () => {
    it("deve ativar um usuário com sucesso", async () => {
      // Arrange
      const userId = "user-id-123"
      const userCpf = "123.456.789-00"
      const token = "123456"

      const inactiveStatus = {
        id: "inactive-status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const activeStatus = {
        id: "active-status-id",
        description: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: userCpf,
        phone: "(11) 99999-9999",
        statusId: inactiveStatus.id,
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: inactiveStatus,
      }

      // Mock the update result to include status
      const updatedUserWithStatus = {
        ...mockUser,
        statusId: activeStatus.id,
        status: activeStatus,
      }

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)
      jest
        .spyOn(UserStatusRepository, "getStatusByDescription")
        .mockResolvedValue(activeStatus)
      jest.spyOn(prisma.user, "update").mockResolvedValue(updatedUserWithStatus)

      // Act
      const result = await UserRepository.activeUser(userCpf, token)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(ActiveUserRepository.existsToken).toHaveBeenCalledWith(
        token,
        userId
      )
      expect(UserStatusRepository.getStatusByDescription).toHaveBeenCalledWith(
        UserStatus.ACTIVE
      )
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { statusId: activeStatus.id },
        include: { status: true },
      })
      expect(result).toEqual(updatedUserWithStatus)
    })

    it("deve lançar NotFoundException quando o usuário não for encontrado para ativação", async () => {
      // Arrange
      const userCpf = "non-existent-cpf"
      const token = "123456"

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null)

      // Act & Assert
      await expect(UserRepository.activeUser(userCpf, token)).rejects.toThrow(
        NotFoundException
      )
      await expect(UserRepository.activeUser(userCpf, token)).rejects.toThrow(
        "Usuario não econtrado"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(ActiveUserRepository.existsToken).not.toHaveBeenCalled()
    })

    it("deve propagar erro quando o token de ativação não for válido", async () => {
      // Arrange
      const userId = "user-id-123"
      const userCpf = "123.456.789-00"
      const token = "invalid-token"

      const inactiveStatus = {
        id: "inactive-status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: userCpf,
        phone: "(11) 99999-9999",
        statusId: inactiveStatus.id,
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: inactiveStatus,
      }

      const tokenError = new Error("Token inválido ou expirado")

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)
      jest
        .spyOn(ActiveUserRepository, "existsToken")
        .mockRejectedValue(tokenError)

      // Act & Assert
      await expect(UserRepository.activeUser(userCpf, token)).rejects.toThrow(
        "Token inválido ou expirado"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(ActiveUserRepository.existsToken).toHaveBeenCalledWith(
        token,
        userId
      )
      expect(UserStatusRepository.getStatusByDescription).not.toHaveBeenCalled()
    })

    it("deve propagar erro ao buscar o status ativo", async () => {
      // Arrange
      const userId = "user-id-123"
      const userCpf = "123.456.789-00"
      const token = "123456"

      const inactiveStatus = {
        id: "inactive-status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: userCpf,
        phone: "(11) 99999-9999",
        statusId: inactiveStatus.id,
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: inactiveStatus,
      }

      const statusError = new Error("Status não encontrado")

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)
      jest.spyOn(ActiveUserRepository, "existsToken").mockResolvedValue(true)
      jest
        .spyOn(UserStatusRepository, "getStatusByDescription")
        .mockRejectedValue(statusError)

      // Act & Assert
      await expect(UserRepository.activeUser(userCpf, token)).rejects.toThrow(
        "Status não encontrado"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(ActiveUserRepository.existsToken).toHaveBeenCalledWith(
        token,
        userId
      )
      expect(UserStatusRepository.getStatusByDescription).toHaveBeenCalledWith(
        UserStatus.ACTIVE
      )
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it("deve propagar erro ao atualizar o usuário", async () => {
      // Arrange
      const userId = "user-id-123"
      const userCpf = "123.456.789-00"
      const token = "123456"

      const inactiveStatus = {
        id: "inactive-status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const activeStatus = {
        id: "active-status-id",
        description: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        cpf: userCpf,
        phone: "(11) 99999-9999",
        statusId: inactiveStatus.id,
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: inactiveStatus,
      }

      const updateError = new Error("Erro ao atualizar usuário")

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser)
      jest.spyOn(ActiveUserRepository, "existsToken").mockResolvedValue(true)
      jest
        .spyOn(UserStatusRepository, "getStatusByDescription")
        .mockResolvedValue(activeStatus)
      jest.spyOn(prisma.user, "update").mockRejectedValue(updateError)

      // Act & Assert
      await expect(UserRepository.activeUser(userCpf, token)).rejects.toThrow(
        "Erro ao atualizar usuário"
      )
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(ActiveUserRepository.existsToken).toHaveBeenCalledWith(
        token,
        userId
      )
      expect(UserStatusRepository.getStatusByDescription).toHaveBeenCalledWith(
        UserStatus.ACTIVE
      )
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { statusId: activeStatus.id },
        include: { status: true },
      })
    })
  })
})
