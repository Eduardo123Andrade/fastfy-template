import { PrismaClient } from "@prisma/client"
import * as SeedsFunction from "./seeds"
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding user_status table...")

  // Create user statuses based on constants
  await SeedsFunction.userStatusSeed(prisma)

  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
