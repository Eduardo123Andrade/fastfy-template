import { UserDto, UserResponse } from '@/interfaces'
import { UserStatus } from '@/types'

const createUserView = (user: UserDto) => {
  const cleanUser: UserResponse = {
    email: user.email,
    name: user.name,
    phone: user.phone,
    status: user.status.description as UserStatus,
  }

  return cleanUser
}

export const UserView = {
  createUserView,
}
