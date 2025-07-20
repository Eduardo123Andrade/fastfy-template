import { CreateUserSchema } from '../../../src/schemas/authentication/user.schema'

describe('User Schemas', () => {
  describe('CreateUserSchema', () => {
    it('deve validar dados corretos', () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(validData)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.birthdate).toBeInstanceOf(Date)
      }
    })

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Te',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })

    it('deve rejeitar senha fraca', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        confirmPassword: 'password',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password')
      }
    })

    it('deve rejeitar senhas que não coincidem', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword')
      }
    })

    it('deve rejeitar CPF inválido', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '111.111.111-11',
        phone: '(11) 99999-9999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('cpf')
      }
    })

    it('deve rejeitar telefone com formato inválido', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '611.779.690-09',
        phone: '11999999999',
        birthdate: '1990-01-01',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone')
      }
    })

    it('deve rejeitar data de nascimento inválida', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: 'data-invalida',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('birthdate')
      }
    })

    it('deve rejeitar data de nascimento futura', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '611.779.690-09',
        phone: '(11) 99999-9999',
        birthdate: futureDate.toISOString().split('T')[0],
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('birthdate')
      }
    })
  })
})
