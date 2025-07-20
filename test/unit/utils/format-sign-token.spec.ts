import { formatSignToken } from "../../../src/utils/format/format-sign-token"

describe("formatSignToken", () => {
  it("deve formatar um token JWT corretamente", () => {
    // Arrange
    const token = "header.payload.signature"

    // Act
    const result = formatSignToken(token)

    // Assert
    expect(result).toBe("header.payload.signature")
  })

  it("deve lidar com tokens com mais de três partes", () => {
    // Arrange
    const token = "header.payload.signature.extra"

    // Act
    const result = formatSignToken(token)

    // Assert
    // Deve ignorar partes extras e retornar apenas as três primeiras
    expect(result).toBe("header.payload.signature")
  })

  it("deve lidar com tokens com menos de três partes", () => {
    // Arrange
    const token = "header.payload"

    // Act & Assert
    // A função atual não lida corretamente com tokens incompletos
    // Isso pode causar um erro ou retornar um resultado inesperado
    expect(() => formatSignToken(token)).not.toThrow()
  })

  it("deve lidar com tokens vazios", () => {
    // Arrange
    const token = ""

    // Act & Assert
    // A função atual não lida corretamente com tokens vazios
    // Isso pode causar um erro ou retornar um resultado inesperado
    expect(() => formatSignToken(token)).not.toThrow()
  })
})
