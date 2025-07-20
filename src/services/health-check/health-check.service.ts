// import { PrismaService } from '@/database'
// import { HealthCheckResponseDto } from './dto'

import prisma from '@/lib/prisma'

const check = async () => {
  // const prisma = new PrismaService()
  try {
    await prisma.$queryRaw`SELECT 1`

    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

export const healthCheckService = {
  check,
}

// export class HealthCheckService {
//   constructor(private readonly prisma: PrismaService) {}

//   async check(): Promise<HealthCheckResponseDto> {
//     // Verificar conexão com o banco de dados
//     try {
//       await this.prisma.$queryRaw`SELECT 1`
//       return {
//         status: 'ok',
//         database: 'connected',
//         timestamp: new Date().toISOString(),
//       }
//     } catch (error) {
//       return {
//         status: 'error',
//         database: 'disconnected',
//         error: error.message,
//         timestamp: new Date().toISOString(),
//       }
//     }
//   }
// }
