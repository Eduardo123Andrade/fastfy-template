import { z } from 'zod'

export const UserLoginSchema = z.object({
  email: z.string({ message: 'Email obrigatorio' }).email('Email inválido'),
  password: z.string({ message: 'Senha obrigatorio' }).min(8, 'Senha inválida'),
})
