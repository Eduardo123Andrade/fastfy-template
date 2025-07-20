import { validateTokenCookie } from "../../../src/utils/validate-token-cookie"
import { Signer } from "@fastify/cookie"

// Mock sign and unsign methods
const mockSign = jest.fn()
const mockUnsign = jest.fn()

// Mock @fastify/cookie
jest.mock("@fastify/cookie", () => {
  return {
    Signer: jest.fn().mockImplementation(() => {
      return {
        sign: mockSign,
        unsign: mockUnsign,
      }
    }),
  }
})

describe("validateTokenCookie", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve validar um token corretamente", () => {
    // Arrange
    const token = "valid-token"
    const signedValue = "signed-valid-token"

    mockSign.mockReturnValue(signedValue)
    mockUnsign.mockReturnValue({ value: token, valid: true })

    // Act
    const result = validateTokenCookie(token)

    // Assert
    expect(result).toBe(true)
    expect(Signer).toHaveBeenCalledWith("secret")
    expect(mockSign).toHaveBeenCalledWith(token)
    expect(mockUnsign).toHaveBeenCalledWith(signedValue)
  })

  it("deve invalidar um token incorreto", () => {
    // Arrange
    const token = "invalid-token"
    const signedValue = "signed-invalid-token"

    mockSign.mockReturnValue(signedValue)
    mockUnsign.mockReturnValue({ value: "", valid: false })

    // Act
    const result = validateTokenCookie(token)

    // Assert
    expect(result).toBe(false)
    expect(Signer).toHaveBeenCalledWith("secret")
    expect(mockSign).toHaveBeenCalledWith(token)
    expect(mockUnsign).toHaveBeenCalledWith(signedValue)
  })

  it("deve lidar com tokens vazios", () => {
    // Arrange
    const token = ""
    const signedValue = "signed-empty-token"

    mockSign.mockReturnValue(signedValue)
    mockUnsign.mockReturnValue({ value: "", valid: false })

    // Act
    const result = validateTokenCookie(token)

    // Assert
    expect(result).toBe(false)
    expect(mockSign).toHaveBeenCalledWith(token)
    expect(mockUnsign).toHaveBeenCalledWith(signedValue)
  })

  it("deve lidar com erros durante a assinatura", () => {
    // Arrange
    const token = "error-token"

    mockSign.mockImplementation(() => {
      throw new Error("Erro na assinatura")
    })

    // Act & Assert
    expect(() => validateTokenCookie(token)).toThrow("Erro na assinatura")
    expect(mockSign).toHaveBeenCalledWith(token)
    expect(mockUnsign).not.toHaveBeenCalled()
  })

  it("deve lidar com erros durante a validação", () => {
    // Arrange
    const token = "error-validation-token"
    const signedValue = "signed-error-token"

    mockSign.mockReturnValue(signedValue)
    mockUnsign.mockImplementation(() => {
      throw new Error("Erro na validação")
    })

    // Act & Assert
    expect(() => validateTokenCookie(token)).toThrow("Erro na validação")
    expect(mockSign).toHaveBeenCalledWith(token)
    expect(mockUnsign).toHaveBeenCalledWith(signedValue)
  })
})
