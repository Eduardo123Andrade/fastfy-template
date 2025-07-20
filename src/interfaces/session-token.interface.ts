import { BaseEntity } from './base-entity.interface'

export interface SessionTokenDTO extends BaseEntity {
  token: string
  userId: string
  isValid: boolean
}
