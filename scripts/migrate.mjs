import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

function loadEnvFile(filename) {
  const path = join(projectRoot, filename)
  if (!existsSync(path)) return

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

// Load .env first, then allow .env.local overrides (matches Next.js precedence)
loadEnvFile('.env')
loadEnvFile('.env.local')

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const host = process.env.DATABASE_HOST ?? 'localhost'
  const port = process.env.DATABASE_PORT ?? '5432'
  const user = process.env.DATABASE_USER ?? 'subtracker_user'
  const password = process.env.DATABASE_PASSWORD ?? ''
  const database = process.env.DATABASE_NAME ?? 'subtracker_db'

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

const connectionString = getConnectionString()
const hostForLog = connectionString.match(/@([^/]+)\//)?.[1] ?? 'unknown'
console.log(`Connecting to Postgres at ${hostForLog}`)

const sql = readFileSync(join(projectRoot, 'migrations/001_initial.sql'), 'utf8')
const client = new pg.Client({ connectionString })

try {
  await client.connect()
  await client.query(sql)
  console.log('Migration completed successfully')
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
} finally {
  await client.end()
}
