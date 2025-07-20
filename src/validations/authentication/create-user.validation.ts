import { CreateUserDto } from '@/interfaces'
import { CreateUserSchema } from '@/schemas'
import { validationWrapper } from '@/utils'

export const validateCreateUserSchemaBody = (data: unknown): CreateUserDto => {
  return validationWrapper(() => CreateUserSchema.parse(data))
}
