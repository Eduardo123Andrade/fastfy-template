import { validateLoginUserSchemaBody } from "../../../src/validations/authentication/login.validation"
import { UserLoginSchema } from "../../../src/schemas/authentication/login.schema"
import { ValidationException } from "../../../src/exceptions"

// Mock the schema
jest.mock("../../../src/schemas/authentication/login.schema", () => ({
  UserLoginSchema: {
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

describe("validateLoginUserSchemaBody", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve validar dados de login válidos", () => {
    // Arrange
    const validLoginData = {
      email: "test@example.com",
      password: "Password123!",
    }

    UserLoginSchema.parse.mockReturnValue(validLoginData)

    // Act
    const result = validateLoginUserSchemaBody(validLoginData)

    // Assert
    expect(result).toEqual(validLoginData)
    expect(UserLoginSchema.parse).toHaveBeenCalledWith(validLoginData)
  })

  it("deve lançar erro para email inválido", () => {
    // Arrange
    const invalidLoginData = {
      email: "invalid-email",
      password: "Password123!",
    }

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Email inválido" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    UserLoginSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateLoginUserSchemaBody(invalidLoginData)).toThrow()
    expect(UserLoginSchema.parse).toHaveBeenCalledWith(invalidLoginData)
  })

  it("deve lançar erro para senha muito curta", () => {
    // Arrange
    const invalidLoginData = {
      email: "test@example.com",
      password: "short",
    }

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Senha inválida" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    UserLoginSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateLoginUserSchemaBody(invalidLoginData)).toThrow()
    expect(UserLoginSchema.parse).toHaveBeenCalledWith(invalidLoginData)
  })

  it("deve lançar erro para dados ausentes", () => {
    // Arrange
    const emptyData = {}

    // Create a ZodError-like object
    const zodError = {
      errors: [
        { message: "Email obrigatorio" },
        { message: "Senha obrigatorio" },
      ],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    UserLoginSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateLoginUserSchemaBody(emptyData)).toThrow()
    expect(UserLoginSchema.parse).toHaveBeenCalledWith(emptyData)
  })

  it("deve lidar com dados de entrada nulos", () => {
    // Arrange
    const nullData = null

    // Setup the mock to throw an error
    UserLoginSchema.parse.mockImplementation(() => {
      throw new Error("Cannot process null data")
    })

    // Act & Assert
    expect(() => validateLoginUserSchemaBody(nullData)).toThrow()
    expect(UserLoginSchema.parse).toHaveBeenCalledWith(nullData)
  })
})
