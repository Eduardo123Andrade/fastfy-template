import { validationWrapper } from "../../../../src/utils/wrappers/validation-wrapper.validation"
import {
  BadRequestException,
  ValidationException,
} from "../../../../src/exceptions"
import { ZodError } from "zod"
import * as z from "zod"

describe("validationWrapper", () => {
  it("deve retornar o resultado da função quando não houver erros", () => {
    // Arrange
    const mockFunction = () => "resultado bem sucedido"

    // Act
    const result = validationWrapper(mockFunction)

    // Assert
    expect(result).toBe("resultado bem sucedido")
  })

  it("deve lançar ValidationException quando ocorrer um ZodError", () => {
    // Arrange
    const schema = z.object({
      nome: z.string().min(3),
      idade: z.number().min(18),
    })

    const mockFunction = () => {
      return schema.parse({ nome: "Jo", idade: 17 })
    }

    // Act & Assert
    expect(() => validationWrapper(mockFunction)).toThrow(ValidationException)
  })

  it("deve lançar BadRequestException quando ocorrer um erro genérico", () => {
    // Arrange
    const mockFunction = () => {
      throw new Error("Erro genérico")
    }

    // Act & Assert
    expect(() => validationWrapper(mockFunction)).toThrow(BadRequestException)
  })

  it("deve preservar a mensagem de erro original no BadRequestException", () => {
    // Arrange
    const mockFunction = () => {
      throw new Error("Erro específico")
    }

    // Act & Assert
    try {
      validationWrapper(mockFunction)
      fail("Deveria ter lançado uma exceção")
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.message).toBe("Something wrong")

      // Use getErrors() method to access the error details
      const errors = error.getErrors()
      expect(errors).toBeDefined()
      expect(errors instanceof Error).toBe(true)
      expect(errors.message).toBe("Erro específico")
    }
  })

  it("deve formatar corretamente os erros de validação do Zod", () => {
    // Arrange
    const schema = z.object({
      nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
      email: z.string().email("Email inválido"),
    })

    const mockFunction = () => {
      return schema.parse({ nome: "Jo", email: "email-invalido" })
    }

    // Act & Assert
    try {
      validationWrapper(mockFunction)
      fail("Deveria ter lançado uma exceção")
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
      expect(error.message).toBe("Dados Invalidos")

      // The ValidationException stores the formatted errors in the 'errors' property
      const errors = error.getErrors()
      expect(errors).toBeDefined()
      expect(errors).toHaveProperty("nome")
      expect(errors).toHaveProperty("email")
    }
  })
})
