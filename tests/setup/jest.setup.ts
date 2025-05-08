import {
  conectDB,
  initializeDatabase,
  TEST_ONLY_RESET_DB_INSTANCE,
  TEST_ONLY_SET_DB_INSTANCE
} from '../../src/config/db.config.js'
import { Database } from 'sqlite'

let dbForSuite: Database

beforeAll(async () => {
  await TEST_ONLY_RESET_DB_INSTANCE()
  // creará una nueva :memory: y la pondrá en el singleton
  dbForSuite = await conectDB()
  TEST_ONLY_SET_DB_INSTANCE(dbForSuite)
  await initializeDatabase(dbForSuite)
})

beforeEach(async () => {
  // Limpia tablas usando la instancia de la suite
  const tables = ['token_blacklist', 'transactions', 'users']
  await dbForSuite.exec('PRAGMA foreign_keys = OFF;')
  for (const table of tables) {
    await dbForSuite.run(`DELETE FROM ${table};`)
    await dbForSuite.run(`DELETE FROM sqlite_sequence WHERE name='${table}';`).catch(() => {})
  }
  await dbForSuite.exec('PRAGMA foreign_keys = ON;')
})

afterAll(async () => {
  await TEST_ONLY_RESET_DB_INSTANCE()
})
