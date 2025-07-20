import cors from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import fastify from "fastify"
import { ENVIRONMENT } from "./config"
import { errorHandler } from "./exceptions/exceptionHandler"
import { onRequestHook } from "./hooks"
import { registerPlugin } from "./plugins"
import { registerRouter } from "./routes"

const app = fastify({
  logger: true,
})

registerPlugin(app)

app.register(fastifyJwt, {
  secret: ENVIRONMENT.JWT_SECRET,
  cookie: {
    cookieName: "auth_token",
    signed: true,
  },
})

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
})

app.register(registerRouter)

app.setErrorHandler(errorHandler)

app.addHook("onRequest", onRequestHook)

app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("Servidor rodando em http://localhost:3333")
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err)
    process.exit(1)
  })
