import { HttpStatusCode } from '@/utils'
import { Exception } from '.'

export class ConflictException extends Exception {
  constructor(message: string) {
    super(message, HttpStatusCode.CONFLICT)
  }
}
