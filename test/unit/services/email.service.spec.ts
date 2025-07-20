import nodemailer from "nodemailer"
import { EmailOptions } from "../../../src/interfaces/email.interface"
import { ENVIRONMENT } from "../../../src/config"

// Mock nodemailer
const mockSendMail = jest.fn()
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
})

jest.mock("nodemailer", () => ({
  createTransport: mockCreateTransport,
}))

// Mock console.error
console.error = jest.fn()

// We need to import the service after mocking dependencies
import { emailService } from "../../../src/services/email.service"

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve enviar email com sucesso", async () => {
    // Arrange
    const emailOptions: EmailOptions = {
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    }

    mockSendMail.mockResolvedValue({ messageId: "123" })

    // Act
    const result = await emailService.sendMail(emailOptions)

    // Assert
    expect(result).toBe(true)
    expect(mockSendMail).toHaveBeenCalledWith({
      from: ENVIRONMENT.EMAIL_FROM,
      to: emailOptions.to,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html,
    })
  })

  it("deve retornar false quando falhar ao enviar email", async () => {
    // Arrange
    const emailOptions: EmailOptions = {
      to: "test@example.com",
      subject: "Test Subject",
    }

    mockSendMail.mockRejectedValue(new Error("Failed to send email"))

    // Act
    const result = await emailService.sendMail(emailOptions)

    // Assert
    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalledWith(
      "Error sending email:",
      expect.any(Error)
    )
  })

  it("deve usar o EMAIL_FROM do ambiente", async () => {
    // Arrange
    const originalEmailFrom = ENVIRONMENT.EMAIL_FROM
    const testEmailFrom = "test@example.com"

    // Temporarily modify ENVIRONMENT.EMAIL_FROM
    Object.defineProperty(ENVIRONMENT, "EMAIL_FROM", {
      value: testEmailFrom,
      configurable: true,
    })

    const emailOptions: EmailOptions = {
      to: "recipient@example.com",
      subject: "Test Subject",
    }

    mockSendMail.mockResolvedValue({ messageId: "123" })

    // Act
    await emailService.sendMail(emailOptions)

    // Assert
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: testEmailFrom,
      })
    )

    // Cleanup
    Object.defineProperty(ENVIRONMENT, "EMAIL_FROM", {
      value: originalEmailFrom,
      configurable: true,
    })
  })

  // it("deve verificar se o transporter foi configurado corretamente", () => {
  //   // Since the service is already instantiated when imported,
  //   // we can only check that createTransport was called
  //   expect(mockCreateTransport).toHaveBeenCalled()

  //   // Check if the first call to createTransport included the expected config
  //   expect(mockCreateTransport.mock.calls.length).toBeGreaterThan(0)

  //   if (mockCreateTransport.mock.calls.length > 0) {
  //     const config = mockCreateTransport.mock.calls[0][0]
  //     expect(config).toMatchObject({
  //       service: ENVIRONMENT.EMAIL_SERVICE,
  //       host: ENVIRONMENT.EMAIL_HOST,
  //       port: ENVIRONMENT.EMAIL_PORT,
  //       secure: ENVIRONMENT.EMAIL_SECURE === "true",
  //       auth: {
  //         user: ENVIRONMENT.EMAIL_USER,
  //         pass: ENVIRONMENT.EMAIL_PASSWORD,
  //       },
  //     })
  //   }
  // })
})
