import { HttpStatusCode } from '@/utils'
import { Exception } from './Exception.exception'

export class UnauthorizedException extends Exception {
  constructor(message = 'Credenciais invalidas, faça login novamente') {
    super(message, HttpStatusCode.UNAUTHORIZED)
  }
}
