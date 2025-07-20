import { validateCPF } from '@/utils'
import { z } from 'zod'

export const CreateUserSchema = z
  .object({
    email: z.string().email('Email inválido'),
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
      ),
    confirmPassword: z.string(),
    cpf: z
      .string()
      .refine(validateCPF, 'CPF inválido')
      .transform((value) => value.replace(/\D/g, '')),
    phone: z
      .string()
      .refine((data) => {
        const regExp = new RegExp(/^\(\d{2}\) \d{5}-\d{4}$/)
        return data.length === 9 || data.length === 11 || regExp.test(data)
      }, 'Formato do telefone inválido')
      .transform((value) => value.replace(/\D/g, '')),
    birthdate: z
      .string()
      .refine(
        (value) => {
          const date = new Date(value)
          return !isNaN(date.getTime()) && date < new Date()
        },
        {
          message: 'Data de nascimento inválida',
        },
      )
      .transform((value) => {
        const date = new Date(value)
        date.setHours(0, 0, 0, 0)
        return date
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
