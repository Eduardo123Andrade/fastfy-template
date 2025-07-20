import { FastifyReply, FastifyRequest } from 'fastify'
import { UsersController } from '../../src/controllers/users.controller'
import { UserService } from '../../src/services/user/user.service'
import { CreateUserDto, UserDto, UserResponse } from '../../src/interfaces/user.interface'
import { HttpStatusCode } from '../../src/utils'
import * as validations from '../../src/validations'
import { UserView } from '../../src/view/user.view'

// Mock do serviço
jest.mock('../../src/services/user/user.service', () => ({
  UserService: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    activeUser: jest.fn(),
  },
}))

// Mock da view
jest.mock('../../src/view/user.view', () => ({
  UserView: {
    createUserView: jest.fn(),
  },
}))

// Mock das validações
jest.mock('../../src/validations')

describe('UsersController', () => {
  let mockRequest: Partial<FastifyRequest>
  let mockReply: Partial<FastifyReply>

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    }

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }

    jest.clearAllMocks()

    // Configuração padrão para as validações
    jest.spyOn(validations, 'validateCreateUserSchemaBody').mockImplementation((data) => data)
    jest.spyOn(validations, 'validateActiveUserSchemaBody').mockImplementation((data) => data)
  })

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      const createUserData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Ls@123123',
        confirmPassword: 'Ls@123123',
        cpf: '61177969009',
        phone: '(11) 99999-9999',
        birthdate: new Date('1990-01-01'),
      }

      const userData: UserDto = {
        ...createUserData,
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: {
          id: '1',
          description: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      mockRequest.body = createUserData

      jest.spyOn(UserService, 'create').mockResolvedValue(userData)

      // Mock da função de view
      const cleanedUserData: UserResponse = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '61177969009',
        phone: '(11) 99999-9999',
        birthdate: new Date('1990-01-01'),
        status: 'ACTIVE',
      }

      jest.spyOn(UserView, 'createUserView').mockReturnValue(cleanedUserData)

      // Act
      await UsersController.create(mockRequest as FastifyRequest, mockReply as FastifyReply)

      // Assert
      expect(UserService.create).toHaveBeenCalledWith(createUserData)
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.CREATED)
      expect(mockReply.send).toHaveBeenCalledWith({ user: cleanedUserData })
    })

    it('deve lidar com erro de validação', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        name: '',
        password: '123',
        confirmPassword: '456',
      }

      mockRequest.body = invalidUserData

      const validationError = new Error('Erro de validação')
      jest.spyOn(validations, 'validateCreateUserSchemaBody').mockImplementation(() => {
        throw validationError
      })

      // Act & Assert
      await expect(UsersController.create(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow('Erro de validação')
      expect(UserService.create).not.toHaveBeenCalled()
    })

    it('deve lidar com erro do serviço', async () => {
      // Arrange
      const createUserData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Ls@123123',
        confirmPassword: 'Ls@123123',
        cpf: '61177969009',
        phone: '(11) 99999-9999',
        birthdate: new Date('1990-01-01'),
      }

      mockRequest.body = createUserData

      const serviceError = new Error('Erro ao criar usuário')
      jest.mocked(UserService.create).mockRejectedValueOnce(serviceError)

      // Act & Assert
      await expect(UsersController.create(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow('Erro ao criar usuário')
      expect(UserService.create).toHaveBeenCalledWith(createUserData)
      expect(UserView.createUserView).not.toHaveBeenCalled()
    })
  })

  describe('activeUser', () => {
    it('deve ativar um usuário com sucesso', async () => {
      // Arrange
      const activeUserData = {
        cpf: '61177969009',
        token: '123456',
      }

      const userData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        cpf: '61177969009',
        phone: '(11) 99999-9999',
        status: {
          id: '1',
          description: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        birthdate: new Date('1990-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.body = activeUserData

      jest.spyOn(UserService, 'activeUser').mockResolvedValue(userData)

      // Act
      await UsersController.activeUser(mockRequest as FastifyRequest, mockReply as FastifyReply)

      // Assert
      expect(validations.validateActiveUserSchemaBody).toHaveBeenCalledWith(activeUserData)
      expect(UserService.activeUser).toHaveBeenCalledWith(activeUserData.cpf, activeUserData.token)
      expect(mockReply.status).toHaveBeenCalledWith(HttpStatusCode.OK)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Usuário ativado com sucesso!',
      })
    })

    it('deve lidar com erro de validação', async () => {
      // Arrange
      const invalidUserData = {
        cpf: '123', // CPF inválido
        token: '', // Token vazio
      }

      mockRequest.body = invalidUserData

      const validationError = new Error('Erro de validação')
      jest.mocked(validations.validateActiveUserSchemaBody).mockImplementation(() => {
        throw validationError
      })

      // Act & Assert
      await expect(UsersController.activeUser(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow('Erro de validação')
      expect(UserService.activeUser).not.toHaveBeenCalled()
    })

    it('deve lidar com erro de token expirado', async () => {
      // Arrange
      const activeUserData = {
        cpf: '61177969009',
        token: '123456',
      }

      mockRequest.body = activeUserData

      const tokenError = new Error('Token expirado')
      jest.mocked(UserService.activeUser).mockRejectedValueOnce(tokenError)

      // Act & Assert
      await expect(UsersController.activeUser(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow('Token expirado')
      expect(UserService.activeUser).toHaveBeenCalledWith(activeUserData.cpf, activeUserData.token)
    })

    it('deve lidar com erro de token não encontrado', async () => {
      // Arrange
      const activeUserData = {
        cpf: '61177969009',
        token: 'invalid-token',
      }

      mockRequest.body = activeUserData

      const notFoundError = new Error('Token not found')
      jest.mocked(UserService.activeUser).mockRejectedValueOnce(notFoundError)

      // Act & Assert
      await expect(UsersController.activeUser(mockRequest as FastifyRequest, mockReply as FastifyReply)).rejects.toThrow('Token not found')
      expect(UserService.activeUser).toHaveBeenCalledWith(activeUserData.cpf, activeUserData.token)
    })
  })
})
