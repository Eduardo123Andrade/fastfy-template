import { validateCreateUserSchemaBody } from "../../../src/validations/authentication/create-user.validation"
import { CreateUserSchema } from "../../../src/schemas/authentication/user.schema"
import { ValidationException } from "../../../src/exceptions"

// Mock the schema
jest.mock("../../../src/schemas/authentication/user.schema", () => ({
  CreateUserSchema: {
    parse: jest.fn(),
  },
}))

// Mock the validation wrapper
jest.mock("../../../src/utils/wrappers/validation-wrapper.validation", () => ({
  validationWrapper: jest.fn((cb) => cb()),
}))

// Mock the exceptions
jest.mock("../../../src/exceptions", () => ({
  ValidationException: jest.fn().mockImplementation(function (error) {
    this.name = "ValidationException"
    this.message = "Validation failed"
    this.error = error
  }),
  BadRequestException: jest.fn().mockImplementation(function (message) {
    this.name = "BadRequestException"
    this.message = message || "Bad request"
  }),
}))

describe("validateCreateUserSchemaBody", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve validar dados de usuário válidos", () => {
    // Arrange
    const validUserData = {
      email: "test@example.com",
      name: "Test User",
      password: "Password123!",
      confirmPassword: "Password123!",
      cpf: "123.456.789-00",
      phone: "(11) 99999-9999",
      birthdate: "1990-01-01",
    }

    const parsedData = {
      ...validUserData,
      birthdate: new Date("1990-01-01"),
      cpf: "12345678900",
      phone: "11999999999",
    }

    CreateUserSchema.parse.mockReturnValue(parsedData)

    // Act
    const result = validateCreateUserSchemaBody(validUserData)

    // Assert
    expect(result).toEqual(parsedData)
    expect(CreateUserSchema.parse).toHaveBeenCalledWith(validUserData)
  })

  it("deve propagar erros de validação do schema", () => {
    // Arrange
    const invalidUserData = {
      email: "invalid-email",
      name: "Te", // Nome muito curto
      password: "123", // Senha muito curta
      confirmPassword: "456", // Não coincide com a senha
      cpf: "123.456.789-01", // CPF inválido
      phone: "123", // Telefone inválido
      birthdate: "invalid-date", // Data inválida
    }

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Invalid email" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    CreateUserSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateCreateUserSchemaBody(invalidUserData)).toThrow()
    expect(CreateUserSchema.parse).toHaveBeenCalledWith(invalidUserData)
  })

  it("deve lidar com dados de entrada nulos ou indefinidos", () => {
    // Arrange
    const nullData = null

    // Setup the mock to throw an error
    CreateUserSchema.parse.mockImplementation(() => {
      throw new Error("Cannot process null data")
    })

    // Act & Assert
    expect(() => validateCreateUserSchemaBody(nullData)).toThrow()
    expect(CreateUserSchema.parse).toHaveBeenCalledWith(nullData)
  })

  it("deve lidar com objetos vazios", () => {
    // Arrange
    const emptyData = {}

    // Setup the mock to throw an error
    CreateUserSchema.parse.mockImplementation(() => {
      throw new Error("Missing required fields")
    })

    // Act & Assert
    expect(() => validateCreateUserSchemaBody(emptyData)).toThrow()
    expect(CreateUserSchema.parse).toHaveBeenCalledWith(emptyData)
  })

  it("deve lidar com dados parciais", () => {
    // Arrange
    const partialData = {
      email: "test@example.com",
      name: "Test User",
    }

    // Setup the mock to throw an error
    CreateUserSchema.parse.mockImplementation(() => {
      throw new Error("Missing required fields")
    })

    // Act & Assert
    expect(() => validateCreateUserSchemaBody(partialData)).toThrow()
    expect(CreateUserSchema.parse).toHaveBeenCalledWith(partialData)
  })
})
