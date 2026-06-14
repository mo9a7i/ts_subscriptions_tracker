import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createGunzip } from 'zlib'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
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

function parseCopyValue(value) {
  if (value === '\\N') return null
  return value
}

function parseCopyLine(line, columnCount) {
  const values = []
  let remaining = line

  for (let i = 0; i < columnCount - 1; i++) {
    const tabIndex = remaining.indexOf('\t')
    if (tabIndex === -1) {
      throw new Error(`Expected ${columnCount} columns, got ${i + 1}`)
    }
    values.push(parseCopyValue(remaining.slice(0, tabIndex)))
    remaining = remaining.slice(tabIndex + 1)
  }

  values.push(parseCopyValue(remaining))
  return values
}

async function extractCopyBlocks(backupPath) {
  const blocks = {
    workspaces: [],
    subscriptions: [],
  }

  let current = null
  let currentColumns = 0

  const stream = createReadStream(backupPath).pipe(createGunzip())
  const rl = createInterface({ input: stream, crlfDelay: Infinity })

  for await (const line of rl) {
    if (line.startsWith('COPY public.workspaces ')) {
      current = 'workspaces'
      currentColumns = 8
      continue
    }

    if (line.startsWith('COPY public.subscriptions ')) {
      current = 'subscriptions'
      currentColumns = 16
      continue
    }

    if (line === '\\.') {
      current = null
      currentColumns = 0
      continue
    }

    if (current) {
      blocks[current].push(parseCopyLine(line, currentColumns))
    }
  }

  return blocks
}

async function importData(client, blocks) {
  await client.query('BEGIN')

  try {
    await client.query('TRUNCATE subscriptions, workspaces RESTART IDENTITY CASCADE')

    for (const row of blocks.workspaces) {
      const [
        id,
        name,
        createdAt,
        updatedAt,
        userId,
        isAnonymous,
        settings,
        sharingUuid,
      ] = row

      await client.query(
        `INSERT INTO workspaces (
          id, name, created_at, updated_at, user_id, is_anonymous, settings, sharing_uuid
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
        [
          id,
          name,
          createdAt,
          updatedAt,
          userId,
          isAnonymous === 't',
          settings || '{}',
          sharingUuid,
        ]
      )
    }

    for (const row of blocks.subscriptions) {
      const [
        id,
        workspaceId,
        name,
        amount,
        currency,
        frequency,
        nextPayment,
        startDate,
        url,
        icon,
        comment,
        labels,
        autoRenewal,
        colors,
        createdAt,
        updatedAt,
      ] = row

      await client.query(
        `INSERT INTO subscriptions (
          id, workspace_id, name, amount, currency, frequency,
          next_payment, start_date, url, icon, comment,
          labels, auto_renewal, colors, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12::text[], $13, $14::jsonb, $15, $16
        )`,
        [
          id,
          workspaceId,
          name,
          amount,
          currency,
          frequency,
          nextPayment,
          startDate,
          url,
          icon,
          comment,
          labels,
          autoRenewal === 't',
          colors,
          createdAt,
          updatedAt,
        ]
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

const backupPath =
  process.argv[2] ||
  'C:/Users/mohan/Downloads/db_cluster-12-08-2025@23-01-32.backup.gz'

const connectionString = getConnectionString()
const hostForLog = connectionString.match(/@([^/]+)\//)?.[1] ?? 'unknown'
console.log(`Import target: ${hostForLog}`)
console.log(`Backup file: ${backupPath}`)

const blocks = await extractCopyBlocks(backupPath)
console.log(
  `Found ${blocks.workspaces.length} workspaces and ${blocks.subscriptions.length} subscriptions`
)

const client = new pg.Client({ connectionString })

try {
  await client.connect()
  await importData(client, blocks)

  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM workspaces) AS workspaces,
      (SELECT COUNT(*)::int FROM subscriptions) AS subscriptions
  `)

  console.log('Import completed successfully')
  console.log(counts.rows[0])
} catch (error) {
  console.error('Import failed:', error)
  process.exit(1)
} finally {
  await client.end()
}
