import dotenv from 'dotenv'
import { SignOptions } from 'jsonwebtoken'
import path from 'path'

dotenv.config()

interface EnvConfig {
  DATABASE_PATH: string
  PORT: number
  JWT_SECRET: string
  JWT_EXPIRES_IN: SignOptions['expiresIn']
  GEOAPIFY_API_KEY: string
  NODE_ENV?: 'test' | 'development' | 'production'
}

if (process.env.DATABASE_PATH === undefined) {
  throw new Error('[ENV] The environment variable DATABASE_PATH is not defined')
}
if (process.env.PORT === undefined) {
  throw new Error('[ENV] The environment variable PORT is not defined file')
}
if (process.env.JWT_SECRET === undefined) {
  throw new Error('[ENV] The environment variable JWT_SECRET is not defined file')
}
if (process.env.JWT_EXPIRES_IN === undefined) {
  throw new Error('[ENV] The environment variable JWT_EXPIRES_IN is not defined file')
}
if (process.env.GEOAPIFY_API_KEY === undefined) {
  throw new Error('[ENV] The environment variable GEOAPIFY_API_KEY is not defined file')
}
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'development'
}

const envVars: EnvConfig = {
  DATABASE_PATH: process.env.NODE_ENV === 'test'
    ? ':memory:'
    : (path.resolve(import.meta.dirname, `../../${process.env.DATABASE_PATH}`)),
  PORT: parseInt(process.env.PORT),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY,
  NODE_ENV: process.env.NODE_ENV as EnvConfig['NODE_ENV']
}

export { envVars }
