import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import path from 'path'
import fs from 'fs'

import { envVars } from './env.config.js'

let dbInstance: Database | null = null
let isTestMemoryDbInitialized = false

const TEST_ONLY_SET_DB_INSTANCE = (db: Database | null): void => {
  dbInstance = db
}

const conectDB = async (): Promise<Database> => {
  if (dbInstance !== null) {
    return dbInstance
  }

  const db = await open({
    filename: envVars.DATABASE_PATH,
    driver: sqlite3.Database
  })

  dbInstance = db
  return db
}

// const dbDir = path.dirname(envVars.DATABASE_PATH)
// if (!fs.existsSync(dbDir)) {
//   fs.mkdirSync(dbDir, { recursive: true })
//   console.log('[DB] Database directory created')
//   await initializeDatabase()
// }

async function ensureDatabaseInitialized (): Promise<void> {
  // No hacer nada si estamos en test usando :memory:
  if (envVars.NODE_ENV === 'test' && envVars.DATABASE_PATH === ':memory:') {
    consoleInitializeLogs('[DB Ensure] Skipping initialization for in-memory test database.')
    return
  }

  consoleInitializeLogs('[DB Ensure] Checking database state...')
  const dbPath = envVars.DATABASE_PATH
  const dbDir = path.dirname(dbPath)

  try {
    // Asegurar que el directorio exista
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      consoleInitializeLogs(`[DB Ensure] Database directory created: ${dbDir}`)
      // Si creamos el directorio inicializamos la BD
      await initializeDatabase()
      consoleInitializeLogs('[DB Ensure] Initial database schema created in new directory.')
    } else {
      consoleInitializeLogs('[DB Ensure] Schema check complete.')
    }
  } catch (error) {
    consoleInitializeLogs('[DB Ensure] FATAL ERROR during database initialization check.', error)
    throw error
  }
}

async function initializeDatabase (dbToInitialize?: Database): Promise<void> {
  consoleInitializeLogs('[DB] Initializing database...')
  const db = dbToInitialize ?? await conectDB()

  if (envVars.NODE_ENV === 'test' && envVars.DATABASE_PATH === ':memory:' && isTestMemoryDbInitialized) {
    return
  }

  await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
  `)
    .then(() => {
      consoleInitializeLogs('[DB Schema] "users" table created')
    })
    .catch((err) => {
      consoleInitializeLogs('[DB Schema] Error creating users table:\n', err.message)
    })

  await db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('REGISTER', 'LOGIN', 'LOGOUT', 'RESTAURANT_SEARCH')),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
  `)
    .then(() => {
      consoleInitializeLogs('[DB Schema] "transactions" table created')
    })
    .catch((err) => {
      consoleInitializeLogs('[DB Schema] Error creating transactions table:\n', err.message)
    })

  await db.run(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        jti TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
  `)
    .then(() => {
      consoleInitializeLogs('[DB Schema] "invalidated_tokens" table created')
    })
    .catch((err) => {
      consoleInitializeLogs('[DB Schema] Error creating invalidated_tokens table:\n', err.message)
    })

  if (envVars.NODE_ENV === 'test' && envVars.DATABASE_PATH === ':memory:') {
    isTestMemoryDbInitialized = true
  }
  consoleInitializeLogs('[DB Schema] Database schema initialized')
}

const consoleInitializeLogs = (message: string, error?: any): void => {
  if (envVars.NODE_ENV !== 'test') {
    if (error != null) {
      console.error(message, error)
    } else {
      console.log(message)
    }
  }
}

const TEST_ONLY_RESET_DB_INSTANCE = async (): Promise<void> => {
  if (dbInstance != null) {
    consoleInitializeLogs('[DB_TEST] Closing existing singleton DB instance.')
    await dbInstance.close().catch(e => consoleInitializeLogs('Error closing DB instance for reset:', e))
  }
  dbInstance = null
  isTestMemoryDbInitialized = false
}
// no me gustan los callbacks jeje
export { conectDB, ensureDatabaseInitialized, initializeDatabase, TEST_ONLY_RESET_DB_INSTANCE, TEST_ONLY_SET_DB_INSTANCE }
