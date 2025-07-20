# Fastify Auction Backend

API de leilões construída com Fastify, Prisma e TypeScript.

## Tecnologias

- Fastify
- Prisma ORM
- TypeScript
- Zod para validação
- Swagger para documentação

## Requisitos

- Node.js 18+
- Yarn
- Docker e Docker Compose (para o banco de dados)

## Instalação

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar o banco de dados
yarn db:up

# Gerar o cliente Prisma
yarn prisma:generate

# Executar migrações
yarn migration:migrate:dev
```

## Executando o projeto

```bash
# Modo de desenvolvimento
yarn start:dev

# Modo de produção
yarn build
yarn start:prod
```

## Documentação da API

A documentação Swagger está disponível em:

```
http://localhost:3000/api
```

## Scripts disponíveis

- `yarn build` - Compila o projeto
- `yarn start:dev` - Inicia o servidor em modo de desenvolvimento
- `yarn test` - Executa os testes
- `yarn db:up` - Inicia o banco de dados com Docker
- `yarn db:down` - Para o banco de dados
- `yarn migration:migrate:dev` - Executa migrações em ambiente de desenvolvimento