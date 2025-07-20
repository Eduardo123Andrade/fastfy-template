import { validateResendActivationTokenSchemaBody } from "../../../src/validations/authentication/resend-activation-token.validation"
import { ResendActivationTokenSchema } from "../../../src/schemas/authentication/resen-activation-token.schema"
import { ValidationException } from "../../../src/exceptions"

// Mock the schema
jest.mock(
  "../../../src/schemas/authentication/resen-activation-token.schema",
  () => ({
    ResendActivationTokenSchema: {
      parse: jest.fn(),
    },
  })
)

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

describe("validateResendActivationTokenSchemaBody", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve validar email válido", () => {
    // Arrange
    const validData = {
      email: "test@example.com",
    }

    ResendActivationTokenSchema.parse.mockReturnValue(validData)

    // Act
    const result = validateResendActivationTokenSchemaBody(validData)

    // Assert
    expect(result).toEqual(validData)
    expect(ResendActivationTokenSchema.parse).toHaveBeenCalledWith(validData)
  })

  it("deve lançar erro para email inválido", () => {
    // Arrange
    const invalidData = {
      email: "invalid-email",
    }

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Email inválido" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    ResendActivationTokenSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateResendActivationTokenSchemaBody(invalidData)).toThrow()
    expect(ResendActivationTokenSchema.parse).toHaveBeenCalledWith(invalidData)
  })

  it("deve lançar erro para email ausente", () => {
    // Arrange
    const emptyData = {}

    // Create a ZodError-like object
    const zodError = {
      errors: [{ message: "Email obrigatorio" }],
      format: jest.fn(),
    }

    // Setup the mock to throw the error
    ResendActivationTokenSchema.parse.mockImplementation(() => {
      throw zodError
    })

    // Act & Assert
    expect(() => validateResendActivationTokenSchemaBody(emptyData)).toThrow()
    expect(ResendActivationTokenSchema.parse).toHaveBeenCalledWith(emptyData)
  })

  it("deve lidar com dados de entrada nulos", () => {
    // Arrange
    const nullData = null

    // Setup the mock to throw an error
    ResendActivationTokenSchema.parse.mockImplementation(() => {
      throw new Error("Cannot process null data")
    })

    // Act & Assert
    expect(() => validateResendActivationTokenSchemaBody(nullData)).toThrow()
    expect(ResendActivationTokenSchema.parse).toHaveBeenCalledWith(nullData)
  })
})
