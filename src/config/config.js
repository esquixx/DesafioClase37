import { config } from 'dotenv'
config()

export const PORT = process.env.PORT
export const MONGO_URI = process.env.MONGO_URI
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME

export const JWT_CLIENT_ID = process.env.JWT_CLIENT_ID
export const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET
export const SECRET_PASS = process.env.SECRET_PASS
export const PRIVATE_KEY = process.env.PRIVATE_KEY
export const SIGNED_COOKIE_KEY = process.env.SIGNED_COOKIE_KEY

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export const PERSISTENCE = process.env.PERSISTENCE

export const NODEMAILER_USER = process.env.NODEMAILER_USER
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS

export const ENVIRONMENT = process.env.ENVIRONMENT