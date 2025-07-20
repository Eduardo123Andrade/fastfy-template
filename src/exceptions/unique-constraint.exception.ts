import { HttpStatusCode } from '@/utils'
import { Exception } from './Exception.exception'

export class UniqueConstraintException extends Exception {
  constructor(message: string) {
    super(message, HttpStatusCode.CONFLICT)
  }
}
