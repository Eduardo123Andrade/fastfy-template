import { validateActiveUserSchemaBody } from "../../../src/validations/user/active-user.validation"
import { ActiveUSerSchema } from "../../../src/schemas/users/active-user.schema"
import { ValidationException } from "../../../src/exceptions"

// Mock the schema
jest.mock("../../../src/schemas/users/active-user.schema", () => ({
  ActiveUSerSchema: {
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

describe("validateActiveUserSchemaBody", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve validar dados de ativação válidos", () => {
    // Arrange
    const validData = {
      email: "test@example.com",
      token: "ABC123",
    }

    ActiveUSerSchema.parse.mockReturnValue(validData)

    // Act
    const result = validateActiveUserSchemaBody(validData)

    // Assert
    expect(result).toEqual(validData)
    expect(ActiveUSerSchema.parse).toHaveBeenCalledWith(validData)
  })

  it("deve lançar erro para email inválido", () => {
    // Arrange
    const invalidData = {
      email: "invalid-email",
      token: "ABC123",
    }

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Email inválido" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    ActiveUSerSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateActiveUserSchemaBody(invalidData)).toThrow()
    expect(ActiveUSerSchema.parse).toHaveBeenCalledWith(invalidData)
  })

  it("deve lançar erro para token inválido", () => {
    // Arrange
    const invalidData = {
      email: "test@example.com",
      token: "12345", // Token muito curto
    }

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Token deve ter exatamente 6 caracteres" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    ActiveUSerSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateActiveUserSchemaBody(invalidData)).toThrow()
    expect(ActiveUSerSchema.parse).toHaveBeenCalledWith(invalidData)
  })

  it("deve lançar erro para dados ausentes", () => {
    // Arrange
    const emptyData = {}

    // Create a ZodError-like object
    const zodError = {
      errors: [
        { message: "Email obrigatorio" },
        { message: "Token obrigatorio" },
      ],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    ActiveUSerSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateActiveUserSchemaBody(emptyData)).toThrow()
    expect(ActiveUSerSchema.parse).toHaveBeenCalledWith(emptyData)
  })

  it("deve lidar com dados de entrada nulos", () => {
    // Arrange
    const nullData = null

    // Setup the mock to throw an error
    ActiveUSerSchema.parse.mockImplementation(() => {
      throw new Error("Cannot process null data")
    })

    // Act & Assert
    expect(() => validateActiveUserSchemaBody(nullData)).toThrow()
    expect(ActiveUSerSchema.parse).toHaveBeenCalledWith(nullData)
  })
})
