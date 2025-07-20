import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const

export const userStatusSeed = async (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
  console.log("Seeding user_status table...")

  const userStatuses = Object.values(UserStatus)

  for (const status of userStatuses) {
    await prisma.userStatus.upsert({
      where: { description: status },
      update: {},
      create: {
        description: status,
      },
    })
  }
}
