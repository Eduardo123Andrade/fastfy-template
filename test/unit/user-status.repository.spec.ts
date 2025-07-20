import { UserStatusRepository } from '../../src/repository/user-status.repository'
import prisma from '../../src/lib/prisma'
import { UserStatusDTO } from '../../src/interfaces'
import { NotFoundException } from '../../src/exceptions'
import { UserStatus } from '../../src/types'

// Mock do Prisma
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    userStatus: {
      findFirst: jest.fn()
    }
  }
}))

describe('UserStatusRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('getStatusByDescription', () => {
    it('deve retornar o status quando encontrado', async () => {
      // Arrange
      const mockStatus: UserStatusDTO = {
        id: 'status-id',
        description: 'ACTIVE'
      }
      
      jest.spyOn(prisma.userStatus, 'findFirst').mockResolvedValue(mockStatus)
      
      // Act
      const result = await UserStatusRepository.getStatusByDescription('ACTIVE' as UserStatus)
      
      // Assert
      expect(prisma.userStatus.findFirst).toHaveBeenCalledWith({
        where: { description: 'ACTIVE' }
      })
      expect(result).toEqual(mockStatus)
    })

    it('deve lançar NotFoundException quando o status não for encontrado', async () => {
      // Arrange
      jest.spyOn(prisma.userStatus, 'findFirst').mockResolvedValue(null)
      
      // Act & Assert
      await expect(
        UserStatusRepository.getStatusByDescription('INACTIVE' as UserStatus)
      ).rejects.toThrow('Status not found')
      
      expect(prisma.userStatus.findFirst).toHaveBeenCalledWith({
        where: { description: 'INACTIVE' }
      })
    })
  })
})