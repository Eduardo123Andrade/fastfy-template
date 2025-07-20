import { UserLoginDto } from '@/interfaces'
import { UserLoginSchema } from '@/schemas'
import { validationWrapper } from '@/utils'

export const validateLoginUserSchemaBody = (data: unknown): UserLoginDto => {
  return validationWrapper(() => UserLoginSchema.parse(data))
}
