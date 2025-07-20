import { BadRequestException, ValidationException } from '@/exceptions'
import { ZodError } from 'zod'

type ValidationFunction<T> = () => T

export const validationWrapper = <T>(callbackFunction: ValidationFunction<T>) => {
  try {
    return callbackFunction()
  } catch (error) {
    if (error instanceof ZodError) throw new ValidationException(error)
    throw new BadRequestException('Something wrong', error)
  }
}
