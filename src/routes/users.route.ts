import { FastifyInstance } from "fastify"
import { UsersController } from "../controllers"

export const usersRouter = async (app: FastifyInstance) => {
  app.patch("/users/active-user", UsersController.activeUser)
}
