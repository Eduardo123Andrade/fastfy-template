import { config } from "dotenv"
config()

export const ENVIRONMENT = {
  DB_HOST: process.env.DB_HOST || "",
  DB_PORT: process.env.DB_PORT || "",
  DB_USERNAME: process.env.DB_USERNAME || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "",
  EMAIL_SECURE: process.env.EMAIL_SECURE || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_ACCESS_EXPIRATION_DAYS: process.env.JWT_ACCESS_EXPIRATION_DAYS
    ? Number.parseInt(process.env.JWT_ACCESS_EXPIRATION_DAYS)
    : 0,
  JWT_REFRESH_EXPIRATION_DAYS: process.env.JWT_REFRESH_EXPIRATION_DAYS
    ? Number.parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS)
    : 0,
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  PORT: process.env.PORT || 3333,
}
