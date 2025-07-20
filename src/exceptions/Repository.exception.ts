import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ConflictException } from './Conflict.exception'

export class RepositoryException {
  static formatError<T extends Error>(error: T) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException('User already exists')

        default:
          throw error
      }
    }

    throw error
  }
}
