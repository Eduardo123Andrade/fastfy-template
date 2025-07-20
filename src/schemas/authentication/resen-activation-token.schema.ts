import { z } from 'zod'

export const ResendActivationTokenSchema = z.object({
  email: z.string({ message: 'Email obrigatorio' }).email('Email inválido'),
})
