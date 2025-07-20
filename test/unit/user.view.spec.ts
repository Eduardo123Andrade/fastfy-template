import { UserDto, UserResponse } from "../../src/interfaces"
import { UserStatus } from "../../src/types"
import { UserView } from "../../src/view/user.view"

describe("UserView", () => {
  describe("createUserView", () => {
    it("deve criar uma visão limpa do usuário com status ACTIVE", () => {
      // Arrange
      const user: UserDto = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: {
          id: "status-id",
          description: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const expectedView: UserResponse = {
        email: "test@example.com",
        name: "Test User",
        phone: "(11) 99999-9999",
        status: "ACTIVE",
      }

      // Act
      const result = UserView.createUserView(user)

      // Assert
      expect(result).toEqual(expectedView)
    })

    it("deve criar uma visão limpa do usuário com status INACTIVE", () => {
      // Arrange
      const user: UserDto = {
        id: "1",
        email: "inactive@example.com",
        name: "Inactive User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: {
          id: "status-id",
          description: "INACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const expectedView: UserResponse = {
        email: "inactive@example.com",
        name: "Inactive User",
        phone: "(11) 99999-9999",
        status: "INACTIVE",
      }

      // Act
      const result = UserView.createUserView(user)

      // Assert
      expect(result).toEqual(expectedView)
    })

    it("deve lidar com usuários sem alguns campos opcionais", () => {
      // Arrange
      const user = {
        id: "1",
        email: "minimal@example.com",
        name: "Minimal User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "", // Campo vazio
        status: {
          id: "status-id",
          description: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserDto

      const expectedView: UserResponse = {
        email: "minimal@example.com",
        name: "Minimal User",
        phone: "",
        status: "ACTIVE",
      }

      // Act
      const result = UserView.createUserView(user)

      // Assert
      expect(result).toEqual(expectedView)
    })

    it("deve manter apenas os campos necessários na visão do usuário", () => {
      // Arrange
      const user: UserDto = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: {
          id: "status-id",
          description: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Act
      const result = UserView.createUserView(user)

      // Assert
      expect(result).not.toHaveProperty("id")
      expect(result).not.toHaveProperty("password")
      expect(result).not.toHaveProperty("cpf")
      expect(result).not.toHaveProperty("birthdate")
      expect(result).not.toHaveProperty("createdAt")
      expect(result).not.toHaveProperty("updatedAt")
      expect(result).toHaveProperty("email")
      expect(result).toHaveProperty("name")
      expect(result).toHaveProperty("phone")
      expect(result).toHaveProperty("status")
    })

    it("deve extrair corretamente o status do objeto status", () => {
      // Arrange
      const user: UserDto = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: {
          id: "status-id",
          description: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        birthdate: new Date("1990-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Act
      const result = UserView.createUserView(user)

      // Assert
      expect(result.status).toBe("ACTIVE")
      expect(typeof result.status).toBe("string")
      expect(result.status).not.toEqual(user.status)
    })
  })
})
