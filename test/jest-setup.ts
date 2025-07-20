import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

// Configurar variáveis de ambiente para teste
dotenv.config({ path: '.env.test' })

const prisma = new PrismaClient()

// Configuração global antes de todos os testes
beforeAll(async () => {
  // Configurar banco de dados de teste
  if (process.env.NODE_ENV === 'test') {
    // Executar migrações em banco de dados de teste
    execSync('npx prisma migrate deploy')
  }
})

// Limpeza após todos os testes
afterAll(async () => {
  await prisma.$disconnect()
})

// Tempo limite global para testes
jest.setTimeout(30000)