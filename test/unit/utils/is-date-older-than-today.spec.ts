import { isDateOlderThanToday } from "../../../src/utils/is-date-older-than-today"

describe("isDateOlderThanToday", () => {
  let originalDateNow: () => number

  beforeEach(() => {
    // Store the original Date.now function
    originalDateNow = Date.now
    // Mock Date.now to return a fixed timestamp (2023-01-01)
    Date.now = jest.fn(() => new Date(2023, 0, 1).getTime())
  })

  afterEach(() => {
    // Restore the original Date.now function
    Date.now = originalDateNow
  })

  it("deve retornar true para data futura", () => {
    // Arrange
    const futureDate = new Date(2023, 0, 2) // 2023-01-02 (um dia depois)

    // Act
    const result = isDateOlderThanToday(futureDate)

    // Assert
    expect(result).toBe(true)
  })

  it("deve retornar true para data atual", () => {
    // Arrange
    const currentDate = new Date(2023, 0, 1) // 2023-01-01 (mesmo dia)

    // Act
    const result = isDateOlderThanToday(currentDate)

    // Assert
    expect(result).toBe(true)
  })

  it("deve retornar false para data passada", () => {
    // Arrange
    const pastDate = new Date(2022, 11, 31) // 2022-12-31 (um dia antes)

    // Act
    const result = isDateOlderThanToday(pastDate)

    // Assert
    expect(result).toBe(false)
  })

  it("deve lidar com diferenças de horas no mesmo dia", () => {
    // Arrange
    // Mock Date.now to return a specific time on 2023-01-01 at 12:00
    Date.now = jest.fn(() => new Date(2023, 0, 1, 12, 0).getTime())

    // Earlier on the same day (2023-01-01 at 10:00)
    const earlierSameDay = new Date(2023, 0, 1, 10, 0)

    // Later on the same day (2023-01-01 at 14:00)
    const laterSameDay = new Date(2023, 0, 1, 14, 0)

    // Act & Assert
    expect(isDateOlderThanToday(earlierSameDay)).toBe(false) // Earlier time should return false
    expect(isDateOlderThanToday(laterSameDay)).toBe(true) // Later time should return true
  })
})
