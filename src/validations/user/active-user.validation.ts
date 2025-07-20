import { ActiveUserDTO } from '@/interfaces'
import { ActiveUSerSchema } from '@/schemas'
import { validationWrapper } from '@/utils'

export const validateActiveUserSchemaBody = (data: unknown): ActiveUserDTO => {
  return validationWrapper(() => ActiveUSerSchema.parse(data))
}
