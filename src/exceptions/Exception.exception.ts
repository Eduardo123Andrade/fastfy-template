import { HttpStatusCode } from '@/utils'

export class Exception extends Error {
  private httpStatus: HttpStatusCode
  private errors: any = []

  constructor(message: string, HttpCode: HttpStatusCode, errors?: any)
  constructor(message: string, httpStatus: HttpStatusCode, errors: any = []) {
    super(message)
    this.httpStatus = httpStatus
    this.errors = errors
  }

  getHttpStatus(): HttpStatusCode {
    return this.httpStatus
  }

  public getMessage(): string {
    return this.message
  }

  public getErrors(): [] {
    return this.errors
  }
}
