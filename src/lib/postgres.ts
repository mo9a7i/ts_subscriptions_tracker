import 'server-only'

import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { pgPool: Pool | undefined }

function getConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const host = process.env.DATABASE_HOST ?? 'localhost'
  const port = process.env.DATABASE_PORT ?? '5432'
  const user = process.env.DATABASE_USER ?? 'subtracker_user'
  const password = process.env.DATABASE_PASSWORD ?? ''
  const database = process.env.DATABASE_NAME ?? 'subtracker_db'

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

export function getPool(): Pool {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString: getConnectionString(),
      max: 10,
    })
  }
  return globalForPg.pgPool
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result as { rows: T[]; rowCount: number | null }
}
