import { ResendActivationTokenLoginDto } from '@/interfaces'
import { ResendActivationTokenSchema } from '@/schemas'
import { validationWrapper } from '@/utils'

export const validateResendActivationTokenSchemaBody = (data: unknown): ResendActivationTokenLoginDto => {
  return validationWrapper(() => ResendActivationTokenSchema.parse(data))
}
