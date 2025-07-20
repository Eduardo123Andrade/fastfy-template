import { AuthRepository } from '../../src/repository/auth/auth.repository'
import prisma from '../../src/lib/prisma'
import { UnauthorizedException } from '../../src/exceptions'

// Mock do Prisma
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    sessionToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

describe('AuthRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveValidToken', () => {
    it('deve salvar um token válido com sucesso', async () => {
      // Arrange
      const token = 'valid-token-123'
      const userId = 'user-id-123'
      
      const expectedResult = {
        id: 'token-id-123',
        token,
        userId,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.sessionToken, 'create').mockResolvedValue(expectedResult)

      // Act
      const result = await AuthRepository.saveValidToken(token, userId)

      // Assert
      expect(prisma.sessionToken.create).toHaveBeenCalledWith({
        data: {
          token,
          userId,
          isValid: true,
        },
      })
      expect(result).toEqual(expectedResult)
    })

    it('deve propagar erros durante a criação do token', async () => {
      // Arrange
      const token = 'valid-token-123'
      const userId = 'user-id-123'
      
      const unexpectedError = new Error('Database connection failed')
      jest.spyOn(prisma.sessionToken, 'create').mockRejectedValue(unexpectedError)

      // Act & Assert
      await expect(AuthRepository.saveValidToken(token, userId)).rejects.toThrow('Database connection failed')
      expect(prisma.sessionToken.create).toHaveBeenCalledWith({
        data: {
          token,
          userId,
          isValid: true,
        },
      })
    })
  })

  describe('findToken', () => {
    it('deve encontrar um token válido com sucesso', async () => {
      // Arrange
      const token = 'valid-token-123'
      const userId = 'user-id-123'
      
      const expectedResult = {
        id: 'token-id-123',
        token,
        userId,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.sessionToken, 'findFirst').mockResolvedValue(expectedResult)

      // Act
      const result = await AuthRepository.findToken(token, userId)

      // Assert
      expect(prisma.sessionToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
          isValid: true,
        },
      })
      expect(result).toEqual(expectedResult)
    })

    it('deve lançar UnauthorizedException quando o token não for encontrado', async () => {
      // Arrange
      const token = 'invalid-token'
      const userId = 'user-id-123'
      
      jest.spyOn(prisma.sessionToken, 'findFirst').mockResolvedValue(null)

      // Act & Assert
      await expect(AuthRepository.findToken(token, userId)).rejects.toThrow(UnauthorizedException)
      expect(prisma.sessionToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId,
          isValid: true,
        },
      })
    })

    it('deve tratar userId como string vazia quando for undefined', async () => {
      // Arrange
      const token = 'valid-token-123'
      const userId = undefined
      
      const expectedResult = {
        id: 'token-id-123',
        token,
        userId: '',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.sessionToken, 'findFirst').mockResolvedValue(expectedResult)

      // Act
      const result = await AuthRepository.findToken(token, userId as unknown as string)

      // Assert
      expect(prisma.sessionToken.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          userId: '',
          isValid: true,
        },
      })
      expect(result).toEqual(expectedResult)
    })
  })
})