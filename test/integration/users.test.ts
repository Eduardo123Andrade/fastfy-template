import { build } from '../helper'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

describe('Users API', () => {
  let app: FastifyInstance
  let prisma: PrismaClient
  
  beforeAll(async () => {
    app = await build()
    prisma = new PrismaClient()
  })
  
  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })
  
  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.user.deleteMany({})
  })
  
  describe('POST /users', () => {
    it('deve criar um novo usuário', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999'
      }
      
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: userData
      })
      
      expect(response.statusCode).toBe(201)
      
      const responseBody = JSON.parse(response.body)
      expect(responseBody).toHaveProperty('id')
      expect(responseBody.email).toBe(userData.email)
      expect(responseBody.name).toBe(userData.name)
      expect(responseBody).not.toHaveProperty('password')
    })
    
    it('deve retornar erro 400 para dados inválidos', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        name: 'T', // Nome muito curto
        password: '123', // Senha muito curta
        confirmPassword: '1234', // Não corresponde
        cpf: '123', // CPF inválido
        phone: '123' // Telefone inválido
      }
      
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: invalidUserData
      })
      
      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toHaveProperty('error', 'Bad Request')
    })
  })
  
  describe('GET /users', () => {
    it('deve retornar lista de usuários', async () => {
      // Criar um usuário para teste
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
          cpf: '123.456.789-00',
          phone: '(11) 99999-9999'
        }
      })
      
      const response = await app.inject({
        method: 'GET',
        url: '/users'
      })
      
      expect(response.statusCode).toBe(200)
      
      const users = JSON.parse(response.body)
      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThan(0)
      expect(users[0]).toHaveProperty('email', 'test@example.com')
    })
  })
})