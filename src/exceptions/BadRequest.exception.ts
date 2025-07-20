import { HttpStatusCode } from '@/utils'
import { Exception } from './Exception.exception'

export class BadRequestException extends Exception {
  constructor(message: string, error?: unknown) {
    super(message, HttpStatusCode.BAD_REQUEST, error)
  }
}
