import { HttpStatusCode } from '@/utils'
import { Exception } from './Exception.exception'

export class NotFoundException extends Exception {
  constructor(message: string) {
    super(message, HttpStatusCode.NOT_FOUND)
  }
}
