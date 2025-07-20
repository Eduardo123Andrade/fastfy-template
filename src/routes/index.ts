import { FastifyInstance } from "fastify"
import { healthCheckRouter } from "./health-check.route"
import { usersRouter } from "./users.route"
import { authRouter } from "./auth.route"

export const registerRouter = async (app: FastifyInstance) => {
  app.register(healthCheckRouter)
  app.register(usersRouter)
  app.register(authRouter)
}
