import { CreateUserDto } from '../../src/interfaces/user.interface'
import { ActiveUserRepository, UserRepository } from '../../src/repository'
import * as userEmailService from '../../src/services/user-email.service'
import { UserService } from '../../src/services/user/user.service'
import { encoder } from '../../src/utils'
import * as validateExpiresTokenModule from '../../src/utils/validate-expires-token'
import * as validateAgeModule from '../../src/utils/validate-age'

// Mock do repositório
jest.mock('../../src/repository/user.repository', () => ({
  UserRepository: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByCpf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    activeUser: jest.fn(),
  },
}))

// Mock do encoder e isOlder
jest.mock('../../src/utils', () => ({
  encoder: {
    codify: jest.fn(),
  },
  HttpStatusCode: {
    BAD_REQUEST: 400,
  },
  isActiveTokenExpired: jest.fn(),
}))

jest.mock('../../src/utils/validate-age', () => {
  return {
    isOlder: jest.fn(),
  }
})

// Mock ActiveUserRepository
jest.mock('../../src/repository/active-user.repository', () => ({
  ActiveUserRepository: {
    createActiveUserToken: jest.fn().mockResolvedValue({
      id: 'token-id',
      token: '123456',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    existsToken: jest.fn().mockResolvedValue(true),
    findUserToken: jest.fn().mockResolvedValue({
      id: 'token-id',
      token: '123456',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  },
}))

// Mock sendActivationEmail
jest.mock('../../src/services/user-email.service', () => ({
  sendActivationEmail: jest.fn().mockResolvedValue(true),
}))

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      const birthdate = new Date('1990-01-01')
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate,
      }

      const hashedPassword = 'hashed_password'
      const expectedUser = {
        id: '1',
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        cpf: userData.cpf,
        phone: userData.phone,
        birthdate: userData.birthdate,
        status: {
          id: 'inactive-status-id',
          description: 'INACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        statusId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockToken = {
        id: 'token-id',
        token: '123456',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(encoder, 'codify').mockResolvedValue(hashedPassword)
      jest.spyOn(validateAgeModule, 'isOlder').mockReturnValue(true)
      jest.spyOn(UserRepository, 'create').mockResolvedValue({
        user: expectedUser,
        token: mockToken,
      })
      jest.spyOn(userEmailService, 'sendActivationEmail').mockResolvedValue(true)

      // Act
      const result = await UserService.create(userData)

      // Assert
      expect(validateAgeModule.isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).toHaveBeenCalledWith(userData.password)
      expect(UserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      })
      expect(userEmailService.sendActivationEmail).toHaveBeenCalledWith({
        token: mockToken.token,
        userEmail: expectedUser.email,
        userName: expectedUser.name,
      })
      expect(result).toEqual(expectedUser)
    })

    it('deve lançar erro quando usuário for menor de idade', async () => {
      // Arrange
      const birthdate = new Date('2010-01-01')
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate,
      }

      jest.spyOn(validateAgeModule, 'isOlder').mockReturnValue(false)

      // Act & Assert
      await expect(UserService.create(userData)).rejects.toThrow('Você precisa ter mais de 18 anos para se cadastrar')
      expect(validateAgeModule.isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).not.toHaveBeenCalled()
      expect(UserRepository.create).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o envio de email falhar', async () => {
      // Arrange
      const birthdate = new Date('1990-01-01')
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate,
      }

      const hashedPassword = 'hashed_password'
      const expectedUser = {
        id: '1',
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        cpf: userData.cpf,
        phone: userData.phone,
        birthdate: userData.birthdate,
        status: {
          id: 'inactive-status-id',
          description: 'INACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        statusId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockToken = {
        id: 'token-id',
        token: '123456',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(encoder, 'codify').mockResolvedValue(hashedPassword)
      jest.spyOn(validateAgeModule, 'isOlder').mockReturnValue(true)
      jest.spyOn(UserRepository, 'create').mockResolvedValue({
        user: expectedUser,
        token: mockToken,
      })
      jest.spyOn(userEmailService, 'sendActivationEmail').mockRejectedValue(new Error('Falha ao enviar email'))

      // Act & Assert
      await expect(UserService.create(userData)).rejects.toThrow('Falha ao enviar email')
      expect(validateAgeModule.isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).toHaveBeenCalledWith(userData.password)
      expect(UserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      })
      expect(userEmailService.sendActivationEmail).toHaveBeenCalledWith({
        token: mockToken.token,
        userEmail: expectedUser.email,
        userName: expectedUser.name,
      })
    })

    it('deve lançar erro quando o repositório falhar ao criar usuário', async () => {
      // Arrange
      const birthdate = new Date('1990-01-01')
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate,
      }

      const hashedPassword = 'hashed_password'
      const errorMessage = 'User already exists'

      jest.spyOn(encoder, 'codify').mockResolvedValue(hashedPassword)
      jest.spyOn(validateAgeModule, 'isOlder').mockReturnValue(true)
      jest.spyOn(UserRepository, 'create').mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(UserService.create(userData)).rejects.toThrow(errorMessage)
      expect(validateAgeModule.isOlder).toHaveBeenCalledWith(birthdate)
      expect(encoder.codify).toHaveBeenCalledWith(userData.password)
      expect(UserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      })
      expect(userEmailService.sendActivationEmail).not.toHaveBeenCalled()
    })
  })

  describe('activeUser', () => {
    it('deve ativar um usuário com sucesso', async () => {
      // Arrange
      const cpf = '123.456.789-00'
      const token = '123456'
      const expectedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
        status: {
          id: 'active-status-id',
          description: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const tokenData = {
        id: 'token-id',
        token: '123456',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(ActiveUserRepository, 'findUserToken').mockResolvedValue(tokenData)
      jest.spyOn(validateExpiresTokenModule, 'isActiveTokenExpired').mockReturnValue(false)
      jest.spyOn(UserRepository, 'activeUser').mockResolvedValue(expectedUser)

      // Act
      const result = await UserService.activeUser(cpf, token)

      // Assert
      expect(ActiveUserRepository.findUserToken).toHaveBeenCalledWith(token, cpf)
      // HERE
      expect(validateExpiresTokenModule.isActiveTokenExpired).toHaveBeenCalledWith(tokenData.createdAt)
      expect(UserRepository.activeUser).toHaveBeenCalledWith(cpf, token)
      expect(result).toEqual(expectedUser)
    })

    it('deve lançar erro quando o token estiver expirado', async () => {
      // Arrange
      const cpf = '123.456.789-00'
      const token = '123456'
      const tokenData = {
        id: 'token-id',
        token: '123456',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(ActiveUserRepository, 'findUserToken').mockResolvedValue(tokenData)
      jest.spyOn(validateExpiresTokenModule, 'isActiveTokenExpired').mockReturnValue(true)

      // Act & Assert
      await expect(UserService.activeUser(cpf, token)).rejects.toThrow('Token expirado')
      expect(ActiveUserRepository.findUserToken).toHaveBeenCalledWith(token, cpf)
      expect(validateExpiresTokenModule.isActiveTokenExpired).toHaveBeenCalledWith(tokenData.createdAt)
      expect(UserRepository.activeUser).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o token não for encontrado', async () => {
      // Arrange
      const cpf = '123.456.789-00'
      const token = 'invalid-token'
      const errorMessage = 'Token not found'

      jest.spyOn(ActiveUserRepository, 'findUserToken').mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(UserService.activeUser(cpf, token)).rejects.toThrow(errorMessage)
      expect(ActiveUserRepository.findUserToken).toHaveBeenCalledWith(token, cpf)
      expect(validateExpiresTokenModule.isActiveTokenExpired).not.toHaveBeenCalled()
      expect(UserRepository.activeUser).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o repositório falhar ao ativar o usuário', async () => {
      // Arrange
      const cpf = '123.456.789-00'
      const token = '123456'
      const errorMessage = 'Erro ao ativar usuário'
      const tokenData = {
        id: 'token-id',
        token: '123456',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(ActiveUserRepository, 'findUserToken').mockResolvedValue(tokenData)
      jest.spyOn(validateExpiresTokenModule, 'isActiveTokenExpired').mockReturnValue(false)
      jest.spyOn(UserRepository, 'activeUser').mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(UserService.activeUser(cpf, token)).rejects.toThrow(errorMessage)
      expect(ActiveUserRepository.findUserToken).toHaveBeenCalledWith(token, cpf)
      expect(validateExpiresTokenModule.isActiveTokenExpired).toHaveBeenCalledWith(tokenData.createdAt)
      expect(UserRepository.activeUser).toHaveBeenCalledWith(cpf, token)
    })
  })

  describe('findById', () => {
    it('deve retornar um usuário quando encontrado pelo ID', async () => {
      // Arrange
      const userId = '1'
      const expectedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
        status: 'ACTIVE',
      }

      jest.spyOn(UserRepository, 'findById').mockResolvedValue(expectedUser)

      // Act
      const result = await UserRepository.findById(userId)

      // Assert
      expect(UserRepository.findById).toHaveBeenCalledWith(userId)
      expect(result).toEqual(expectedUser)
    })

    it('deve lançar erro quando o usuário não for encontrado pelo ID', async () => {
      // Arrange
      const userId = 'invalid-id'
      const errorMessage = 'Usuario não econtrado'

      jest.spyOn(UserRepository, 'findById').mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(UserRepository.findById(userId)).rejects.toThrow(errorMessage)
      expect(UserRepository.findById).toHaveBeenCalledWith(userId)
    })
  })

  describe('findByEmail', () => {
    it('deve retornar um usuário quando encontrado pelo email', async () => {
      // Arrange
      const email = 'test@example.com'
      const expectedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
        status: 'ACTIVE',
      }

      jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue(expectedUser)

      // Act
      const result = await UserRepository.findByEmail(email)

      // Assert
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(result).toEqual(expectedUser)
    })

    it('deve lançar erro quando o usuário não for encontrado pelo email', async () => {
      // Arrange
      const email = 'nonexistent@example.com'
      const errorMessage = 'Usuario não econtrado'

      jest.spyOn(UserRepository, 'findByEmail').mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(UserRepository.findByEmail(email)).rejects.toThrow(errorMessage)
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(email)
    })
  })

  describe('findByCpf', () => {
    it('deve retornar um usuário quando encontrado pelo CPF', async () => {
      // Arrange
      const cpf = '123.456.789-00'
      const expectedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthdate: new Date(),
        status: 'ACTIVE',
      }

      jest.spyOn(UserRepository, 'findByCpf').mockResolvedValue(expectedUser)

      // Act
      const result = await UserRepository.findByCpf(cpf)

      // Assert
      expect(UserRepository.findByCpf).toHaveBeenCalledWith(cpf)
      expect(result).toEqual(expectedUser)
    })

    it('deve lançar erro quando o usuário não for encontrado pelo CPF', async () => {
      // Arrange
      const cpf = '999.999.999-99'
      const errorMessage = 'Usuario não econtrado'

      jest.spyOn(UserRepository, 'findByCpf').mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(UserRepository.findByCpf(cpf)).rejects.toThrow(errorMessage)
      expect(UserRepository.findByCpf).toHaveBeenCalledWith(cpf)
    })
  })
})
