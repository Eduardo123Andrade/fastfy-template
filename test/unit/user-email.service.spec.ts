import { sendActivationEmail } from '../../src/services/user-email.service'
import { emailService } from '../../src/services/email.service'
import { UserDto } from '../../src/interfaces'

// Mock do serviço de email
jest.mock('../../src/services/email.service', () => ({
  emailService: {
    sendMail: jest.fn().mockResolvedValue(true),
  },
}))

describe('UserEmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendActivationEmail', () => {
    it('deve enviar um email de ativação com sucesso', async () => {
      // Arrange
      const mockUser: UserDto = {
        id: 'user-id-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        status: 'INACTIVE',
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const token = '123456'

      // Act
      const result = await sendActivationEmail({
        token,
        userEmail: mockUser.email,
        userName: mockUser.name,
      })

      // Assert
      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Ative sua conta',
        html: expect.stringContaining(token),
      })
      expect(result).toBe(true)
    })

    it('deve retornar false quando o envio de email falha', async () => {
      // Arrange
      const mockUser: UserDto = {
        id: 'user-id-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        status: 'INACTIVE',
        birthdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const token = '123456'

      // Mock para simular falha no envio
      jest.spyOn(emailService, 'sendMail').mockResolvedValueOnce(false)

      // Act
      const result = await sendActivationEmail({
        token,
        userEmail: mockUser.email,
        userName: mockUser.name,
      })

      // Assert
      expect(emailService.sendMail).toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})
