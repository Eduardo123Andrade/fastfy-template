import { UserRepository } from '../../src/repository/user.repository'
import prisma from '../../src/lib/prisma'
import { CreateUserDto, UserDto } from '../../src/interfaces/user.interface'
import { ConflictException, NotFoundException } from '../../src/exceptions'
import { ActiveUserRepository } from '../../src/repository/active-user.repository'

// Mock do Prisma
jest.mock('../../src/lib/prisma', () => ({
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
jest.mock('../../src/repository/active-user.repository', () => ({
  ActiveUserRepository: {
    createActiveUserToken: jest.fn().mockResolvedValue({
      id: 'token-id',
      token: '123456',
      userId: 'status-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    existsToken: jest.fn().mockResolvedValue(true),
  },
}))

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
      }

      const mockStatus = {
        id: 'status-id',
        description: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const expectedUser = {
        id: 'status-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        statusId: 'status-id',
        status: 'INACTIVE',
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.userStatus, 'findFirst').mockResolvedValue(mockStatus)
      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser)

      // Act
      const result = await UserRepository.create(userData)

      // Assert
      expect(prisma.userStatus.findFirst).toHaveBeenCalled()
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
          cpf: '123.456.789-00',
          phone: '(11) 99999-9999',
          statusId: 'status-id',
          birthdate: expect.any(Date),
        },
      })
      expect(ActiveUserRepository.createActiveUserToken).toHaveBeenCalledWith(expectedUser.id)
      expect(result).toEqual({
        user: {
          ...expectedUser,
          status: mockStatus,
        },
        token: {
          id: 'token-id',
          token: '123456',
          userId: 'status-id',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
    })

    it('deve lançar ConflictException quando o usuário já existe', async () => {
      // Arrange
      const userData: CreateUserDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
      }

      const mockStatus = {
        id: 'status-id',
        description: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const prismaError: Error & { code?: string } = new Error('Unique constraint failed')
      prismaError.code = 'P2002'

      jest.spyOn(prisma.userStatus, 'findFirst').mockResolvedValue(mockStatus)
      jest.spyOn(prisma.user, 'create').mockRejectedValue(prismaError)

      // Act & Assert
      await expect(UserRepository.create(userData)).rejects.toThrow('User already exists')
    })

    it('deve propagar outros erros durante a criação do usuário', async () => {
      // Arrange
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
      }

      const mockStatus = {
        id: 'status-id',
        description: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const unexpectedError = new Error('Database connection failed')

      jest.spyOn(prisma.userStatus, 'findFirst').mockResolvedValue(mockStatus)
      jest.spyOn(prisma.user, 'create').mockRejectedValue(unexpectedError)

      // Act & Assert
      await expect(UserRepository.create(userData)).rejects.toThrow('Database connection failed')
    })
  })

  describe('findById', () => {
    it('deve encontrar um usuário pelo ID com sucesso', async () => {
      // Arrange
      const userId = 'user-id-123'
      const mockStatus = {
        id: 'status-id',
        description: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        statusId: 'status-id',
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: mockStatus,
      }

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser)

      // Act
      const result = await UserRepository.findById(userId)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { status: true },
      })
      expect(result).toEqual({
        ...mockUser,
        status: mockStatus.description,
      })
    })

    it('deve lançar NotFoundException quando o usuário não for encontrado', async () => {
      // Arrange
      const userId = 'non-existent-id'

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)

      // Act & Assert
      await expect(UserRepository.findById(userId)).rejects.toThrow('Usuario não econtrado')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { status: true },
      })
    })
  })

  describe('activeUser', () => {
    it('deve ativar um usuário com sucesso', async () => {
      // Arrange
      const userId = 'user-id-123'
      const token = '123456'
      const userCpf = '123.456.789-00'

      const inactiveStatus = {
        id: 'inactive-status-id',
        description: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const activeStatus = {
        id: 'active-status-id',
        description: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        statusId: inactiveStatus.id,
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: inactiveStatus,
      }

      const updatedUser = {
        ...mockUser,
        statusId: activeStatus.id,
        status: activeStatus,
      }

      const mockToken = {
        id: 'token-id',
        userId: userId,
        token: token,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser)
      jest.spyOn(prisma.userStatus, 'findFirst').mockResolvedValue(activeStatus)
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser)
      jest.spyOn(prisma.activeUserToken, 'findFirst').mockResolvedValue(mockToken)

      // Act
      const result = await UserRepository.activeUser(userCpf, token)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: userCpf },
        include: { status: true },
      })
      expect(ActiveUserRepository.existsToken).toHaveBeenCalledWith(token, userId)
      expect(prisma.userStatus.findFirst).toHaveBeenCalled()
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { statusId: activeStatus.id },
        include: {
          status: true,
        },
      })
      expect(result).toEqual({
        ...updatedUser,
        status: activeStatus,
      })
    })
  })
})
