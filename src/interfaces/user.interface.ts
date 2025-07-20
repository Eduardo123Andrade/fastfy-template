import { UserStatus } from '@/types'
import { UserStatusDTO } from './status/user-status.interface'
import { BaseEntity } from './base-entity.interface'

export interface UserDto extends BaseEntity {
  email: string
  name: string
  password: string
  cpf: string
  phone: string
  status: UserStatusDTO
  birthdate: Date
}

export interface CreateUserDto extends Omit<UserDto, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  confirmPassword: string
}

export interface UserResponse extends Pick<UserDto, 'name' | 'email' | 'phone'> {
  status: UserStatus
}

export interface UserLoginDto extends Pick<UserDto, 'email' | 'password'> {}

export interface ResendActivationTokenLoginDto extends Pick<UserDto, 'email'> {}
