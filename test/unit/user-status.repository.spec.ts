import { UserStatusRepository } from "../../src/repository/user/user-status.repository"
import prisma from "../../src/lib/prisma"
import { UserStatusDTO } from "../../src/interfaces"
import { NotFoundException } from "../../src/exceptions"
import { UserStatus } from "../../src/utils/constants/status/user-status"

// Mock do Prisma
jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    userStatus: {
      findFirst: jest.fn(),
    },
  },
}))

describe("UserStatusRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getStatusByDescription", () => {
    it("deve retornar o status quando encontrado com ACTIVE", async () => {
      // Arrange
      const mockStatus: UserStatusDTO = {
        id: "status-id",
        description: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.userStatus, "findFirst").mockResolvedValue(mockStatus)

      // Act
      const result = await UserStatusRepository.getStatusByDescription(
        UserStatus.ACTIVE
      )

      // Assert
      expect(prisma.userStatus.findFirst).toHaveBeenCalledWith({
        where: { description: UserStatus.ACTIVE },
      })
      expect(result).toEqual(mockStatus)
    })

    it("deve retornar o status quando encontrado com INACTIVE", async () => {
      // Arrange
      const mockStatus: UserStatusDTO = {
        id: "status-id",
        description: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(prisma.userStatus, "findFirst").mockResolvedValue(mockStatus)

      // Act
      const result = await UserStatusRepository.getStatusByDescription(
        UserStatus.INACTIVE
      )

      // Assert
      expect(prisma.userStatus.findFirst).toHaveBeenCalledWith({
        where: { description: UserStatus.INACTIVE },
      })
      expect(result).toEqual(mockStatus)
    })

    it("deve lançar NotFoundException quando o status não for encontrado", async () => {
      // Arrange
      jest.spyOn(prisma.userStatus, "findFirst").mockResolvedValue(null)

      // Act & Assert
      await expect(
        UserStatusRepository.getStatusByDescription(UserStatus.ACTIVE)
      ).rejects.toThrow(NotFoundException)

      await expect(
        UserStatusRepository.getStatusByDescription(UserStatus.ACTIVE)
      ).rejects.toThrow("Status not found")

      expect(prisma.userStatus.findFirst).toHaveBeenCalledWith({
        where: { description: UserStatus.ACTIVE },
      })
    })

    it("deve propagar erros do banco de dados", async () => {
      // Arrange
      const dbError = new Error("Database connection error")
      jest.spyOn(prisma.userStatus, "findFirst").mockRejectedValue(dbError)

      // Act & Assert
      await expect(
        UserStatusRepository.getStatusByDescription(UserStatus.ACTIVE)
      ).rejects.toThrow("Database connection error")

      expect(prisma.userStatus.findFirst).toHaveBeenCalledWith({
        where: { description: UserStatus.ACTIVE },
      })
    })
  })
})
