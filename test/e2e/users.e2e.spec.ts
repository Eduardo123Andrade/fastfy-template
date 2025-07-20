import { build } from '../helper'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

describe('Users E2E Tests', () => {
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    app = await build()
    prisma = new PrismaClient()
    await app.ready()
  })

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    await prisma.activeUserToken.deleteMany({})
    await prisma.user.deleteMany({})
  })

  afterAll(async () => {
    await prisma.activeUserToken.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.$disconnect()
    await app.close()
  })

  it('deve criar um novo usuário', async () => {
    const userData = {
      email: 'test1@example.com',
      name: 'Test User 1',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '61177969009',
      phone: '(11) 99999-9999',
      birthdate: '2000-01-01',
    }

    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: userData,
    })

    expect(response.statusCode).toBe(201)

    const responseBody = JSON.parse(response.body)
    expect(responseBody.user).toHaveProperty('id')
    expect(responseBody.user.email).toBe(userData.email)
  })

  it('deve rejeitar a criação de usuário com email duplicado', async () => {
    // Primeiro criar um usuário
    const firstUser = {
      email: 'duplicate@example.com',
      name: 'First User',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '61177969009',
      phone: '(11) 99999-9999',
      birthdate: '2000-01-01',
    }

    await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: firstUser,
    })

    // Tentar criar outro com o mesmo email
    const duplicateEmail = {
      email: 'duplicate@example.com', // Email duplicado
      name: 'Second User',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '26808369011', // CPF diferente
      phone: '(22) 88888-8888',
      birthdate: '2000-01-01',
    }

    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: duplicateEmail,
    })

    expect(response.statusCode).toBe(409)

    const responseBody = JSON.parse(response.body)
    expect(responseBody).toHaveProperty('message', 'User already exists')
  })

  it('deve rejeitar a criação de usuário com CPF duplicado', async () => {
    // Primeiro criar um usuário
    const firstUser = {
      email: 'user1@example.com',
      name: 'First User',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '61177969009',
      phone: '(11) 99999-9999',
      birthdate: '2000-01-01',
    }

    await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: firstUser,
    })

    // Tentar criar outro com o mesmo CPF
    const duplicateCpf = {
      email: 'user2@example.com', // Email diferente
      name: 'Second User',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '61177969009', // CPF duplicado
      phone: '(22) 88888-8888',
      birthdate: '2000-01-01',
    }

    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: duplicateCpf,
    })

    expect(response.statusCode).toBe(409)

    const responseBody = JSON.parse(response.body)
    expect(responseBody).toHaveProperty('message', 'User already exists')
  })

  it('deve ativar um usuário com sucesso', async () => {
    // Criar um usuário primeiro
    const userData = {
      email: 'activate@example.com',
      name: 'Activate User',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '26808369011',
      phone: '(11) 99999-9999',
      birthdate: '2000-01-01',
    }

    const createResponse = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: userData,
    })

    expect(createResponse.statusCode).toBe(201)
    const responseData = JSON.parse(createResponse.body)
    const createdUser = responseData.user

    // Buscar o token gerado para o usuário
    const token = await prisma.activeUserToken.findFirst({
      where: { userId: createdUser.id },
    })

    if (!token) throw new Error('Token not found')

    expect(token).not.toBeNull()

    // Ativar o usuário
    const activateResponse = await app.inject({
      method: 'PATCH',
      url: '/users/active-user',
      payload: {
        cpf: createdUser.cpf,
        token: token.token,
      },
    })

    expect(activateResponse.statusCode).toBe(200)

    const responseBody = JSON.parse(activateResponse.body)
    expect(responseBody).toHaveProperty('message', 'Usuário ativado com sucesso!')
  })

  it('deve rejeitar a ativação com token inválido', async () => {
    // Criar um usuário primeiro
    const userData = {
      email: 'invalid-token@example.com',
      name: 'Invalid Token User',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      cpf: '61177969009',
      phone: '(11) 99999-9999',
      birthdate: '2000-01-01',
    }

    const createResponse = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: userData,
    })

    expect(createResponse.statusCode).toBe(201)
    const responseData = JSON.parse(createResponse.body)
    const createdUser = responseData.user

    // Tentar ativar com token inválido
    const activateResponse = await app.inject({
      method: 'PATCH',
      url: '/users/active-user',
      payload: {
        cpf: createdUser.cpf,
        token: '000000', // Token inválido
      },
    })

    expect(activateResponse.statusCode).toBe(404)
    const responseBody = JSON.parse(activateResponse.body)
    expect(responseBody).toHaveProperty('message', 'Token not found')
  })
})
