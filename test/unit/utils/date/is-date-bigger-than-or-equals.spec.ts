import { isDateBiggerThanOrEquals } from "../../../../src/utils/date/is-date-bigger-than-or-equals"

describe("isDateBiggerThanOrEquals", () => {
  it("deve retornar true quando a diferença entre datas é exatamente igual ao valor especificado", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 1, 10, 0) // 2023-01-01 10:00
    const nextDate = new Date(2023, 0, 1, 14, 0) // 2023-01-01 14:00
    const differenceInHours = 4 // Exatamente 4 horas de diferença

    // Act
    const result = isDateBiggerThanOrEquals(
      currentDate,
      nextDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(true)
  })

  it("deve retornar true quando a diferença entre datas é maior que o valor especificado", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 1, 10, 0) // 2023-01-01 10:00
    const nextDate = new Date(2023, 0, 1, 16, 0) // 2023-01-01 16:00
    const differenceInHours = 4 // 6 horas de diferença, maior que 4

    // Act
    const result = isDateBiggerThanOrEquals(
      currentDate,
      nextDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(true)
  })

  it("deve retornar false quando a diferença entre datas é menor que o valor especificado", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 1, 10, 0) // 2023-01-01 10:00
    const nextDate = new Date(2023, 0, 1, 12, 0) // 2023-01-01 12:00
    const differenceInHours = 4 // 2 horas de diferença, menor que 4

    // Act
    const result = isDateBiggerThanOrEquals(
      currentDate,
      nextDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(false)
  })

  it("deve retornar true para datas em dias diferentes com diferença suficiente", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 1, 20, 0) // 2023-01-01 20:00
    const nextDate = new Date(2023, 0, 2, 10, 0) // 2023-01-02 10:00
    const differenceInHours = 12 // 14 horas de diferença, maior que 12

    // Act
    const result = isDateBiggerThanOrEquals(
      currentDate,
      nextDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(true)
  })

  it("deve retornar false para datas em ordem inversa (data atual maior que a próxima)", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 2, 10, 0) // 2023-01-02 10:00
    const nextDate = new Date(2023, 0, 1, 10, 0) // 2023-01-01 10:00
    const differenceInHours = 4 // Diferença negativa

    // Act
    const result = isDateBiggerThanOrEquals(
      currentDate,
      nextDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(false)
  })

  it("deve lidar corretamente com diferenças de minutos", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 1, 10, 0) // 2023-01-01 10:00
    const nextDate = new Date(2023, 0, 1, 11, 45) // 2023-01-01 11:45
    const differenceInHours = 1.5 // 1 hora e 45 minutos = 1.75 horas

    // Act
    const result = isDateBiggerThanOrEquals(
      currentDate,
      nextDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(true)
  })

  it("deve retornar false para datas iguais quando a diferença esperada é maior que zero", () => {
    // Arrange
    const sameDate = new Date(2023, 0, 1, 10, 0) // Mesma data
    const differenceInHours = 1 // Esperando pelo menos 1 hora de diferença

    // Act
    const result = isDateBiggerThanOrEquals(
      sameDate,
      sameDate,
      differenceInHours
    )

    // Assert
    expect(result).toBe(false)
  })
})
