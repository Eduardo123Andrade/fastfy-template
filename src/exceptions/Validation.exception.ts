import { ZodError, ZodIssue } from 'zod'
import { Exception } from './Exception.exception'
import { HttpStatusCode } from '@/utils'

export const formatValidationError = (error: ZodIssue[]) => {
  const errors: any = {}

  error.filter((err: ZodIssue) => !!err.path.length).map((err: ZodIssue) => (errors[err.path[0]] = err.message))

  return errors
}

export class ValidationException extends Exception {
  constructor(error: ZodError) {
    super('Dados Invalidos', HttpStatusCode.BAD_REQUEST, formatValidationError(error.issues))
  }
}
