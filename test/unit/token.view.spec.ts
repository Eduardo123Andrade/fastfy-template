import { SessionTokenDTO } from "../../src/interfaces"
import { TokenView } from "../../src/view/token.view"

describe("TokenView", () => {
  describe("cleanToken", () => {
    it("deve extrair apenas o token da sessão", () => {
      // Arrange
      const sessionToken: SessionTokenDTO = {
        id: "token-id-123",
        token: "jwt-token-value",
        userId: "user-id-123",
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Act
      const result = TokenView.cleanToken(sessionToken)

      // Assert
      expect(result).toBe("jwt-token-value")
      expect(typeof result).toBe("string")
    })

    it("deve funcionar com token vazio", () => {
      // Arrange
      const sessionToken: SessionTokenDTO = {
        id: "token-id-123",
        token: "",
        userId: "user-id-123",
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Act
      const result = TokenView.cleanToken(sessionToken)

      // Assert
      expect(result).toBe("")
      expect(typeof result).toBe("string")
    })

    it("deve retornar o token mesmo quando outros campos estão ausentes", () => {
      // Arrange
      const sessionToken = {
        id: undefined,
        token: "jwt-token-value",
        userId: undefined,
        isValid: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      } as SessionTokenDTO

      // Act
      const result = TokenView.cleanToken(sessionToken)

      // Assert
      expect(result).toBe("jwt-token-value")
    })
  })
})
