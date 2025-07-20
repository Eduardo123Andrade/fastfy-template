import { NotFoundException } from '@/exceptions'
import { UserStatusDTO } from '@/interfaces'
import prisma from '@/lib/prisma'
import { UserStatus } from '@/types'

const getStatusByDescription = async (description: UserStatus): Promise<UserStatusDTO> => {
  const status = await prisma.userStatus.findFirst({
    where: { description },
  })

  if (!status) throw new NotFoundException('Status not found ')

  return status
}

export const UserStatusRepository = {
  getStatusByDescription,
}
