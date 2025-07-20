import { validateCPF } from '@/utils'
import { z } from 'zod'

export const ActiveUSerSchema = z.object({
  email: z.string({ message: 'Email obrigatorio' }).email('Email inválido'),
  token: z
    .string()
    .length(6)
    .nonempty()
    .refine((data) => !Number.isSafeInteger(data), {
      message: 'Token inválido',
      path: ['token'],
    }),
})
