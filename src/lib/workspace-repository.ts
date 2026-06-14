import 'server-only'

import { query } from './postgres'
import type { Subscription, CreateSubscriptionData } from '@/types'

export interface DbSubscriptionRow {
  id: string
  workspace_id: string
  name: string
  amount: string | number
  currency: string
  frequency: string
  next_payment: string
  start_date: string | null
  url: string | null
  icon: string | null
  comment: string | null
  labels: string[]
  auto_renewal: boolean
  colors: Record<string, string> | null
  created_at: Date | string
  updated_at: Date | string
}

export interface DbSharedSubscriptionRow extends DbSubscriptionRow {
  sharing_uuid: string
  workspace_name: string
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

export function mapRowToSubscription(row: DbSubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    currency: row.currency,
    frequency: row.frequency as Subscription['frequency'],
    nextPayment: row.next_payment,
    startDate: row.start_date || undefined,
    url: row.url || undefined,
    icon: row.icon || undefined,
    comment: row.comment || undefined,
    labels: row.labels || [],
    autoRenewal: row.auto_renewal,
    colors: row.colors || undefined,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

export async function workspaceExists(workspaceId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    'SELECT id FROM workspaces WHERE id = $1',
    [workspaceId]
  )
  return result.rows.length > 0
}

export async function initializeWorkspace(workspaceId: string, name?: string): Promise<void> {
  const exists = await workspaceExists(workspaceId)
  if (exists) return

  await query(
    `INSERT INTO workspaces (id, name, is_anonymous)
     VALUES ($1, $2, TRUE)`,
    [workspaceId, name || 'My Subscriptions']
  )
}

export async function getWorkspaceName(workspaceId: string): Promise<string> {
  const result = await query<{ name: string }>(
    'SELECT name FROM workspaces WHERE id = $1',
    [workspaceId]
  )
  return result.rows[0]?.name ?? 'My Subscriptions'
}

export async function getSharingUuid(workspaceId: string): Promise<string | null> {
  const result = await query<{ sharing_uuid: string | null }>(
    'SELECT sharing_uuid FROM workspaces WHERE id = $1',
    [workspaceId]
  )
  return result.rows[0]?.sharing_uuid ?? null
}

export async function generateSharingLink(workspaceId: string): Promise<string> {
  const existing = await getSharingUuid(workspaceId)
  if (existing) return existing

  const sharingUuid = crypto.randomUUID()
  await query(
    `UPDATE workspaces
     SET sharing_uuid = $1, updated_at = NOW()
     WHERE id = $2`,
    [sharingUuid, workspaceId]
  )
  return sharingUuid
}

export async function claimWorkspace(workspaceId: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE workspaces
     SET user_id = $1, is_anonymous = FALSE, updated_at = NOW()
     WHERE id = $2 AND (user_id IS NULL OR user_id = $1)`,
    [userId, workspaceId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function getSubscriptions(workspaceId: string): Promise<Subscription[]> {
  const result = await query<DbSubscriptionRow>(
    `SELECT * FROM subscriptions
     WHERE workspace_id = $1
     ORDER BY created_at DESC`,
    [workspaceId]
  )
  return result.rows.map(mapRowToSubscription)
}

export async function addSubscription(
  workspaceId: string,
  subscription: CreateSubscriptionData
): Promise<Subscription> {
  await initializeWorkspace(workspaceId)

  const result = await query<DbSubscriptionRow>(
    `INSERT INTO subscriptions (
      workspace_id, name, amount, currency, frequency,
      next_payment, start_date, url, icon, comment,
      labels, auto_renewal, colors
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      workspaceId,
      subscription.name,
      subscription.amount,
      subscription.currency,
      subscription.frequency,
      subscription.nextPayment,
      subscription.startDate || null,
      subscription.url || null,
      subscription.icon || null,
      subscription.comment || null,
      subscription.labels || [],
      subscription.autoRenewal ?? true,
      subscription.colors ? JSON.stringify(subscription.colors) : null,
    ]
  )

  return mapRowToSubscription(result.rows[0])
}

export async function updateSubscription(
  workspaceId: string,
  id: string,
  updates: Partial<Subscription>
): Promise<void> {
  const fields: string[] = []
  const values: unknown[] = []
  let index = 1

  const mapping: Record<string, unknown> = {
    name: updates.name,
    amount: updates.amount,
    currency: updates.currency,
    frequency: updates.frequency,
    next_payment: updates.nextPayment,
    start_date: updates.startDate,
    url: updates.url,
    icon: updates.icon,
    comment: updates.comment,
    labels: updates.labels,
    auto_renewal: updates.autoRenewal,
    colors: updates.colors ? JSON.stringify(updates.colors) : updates.colors,
  }

  for (const [column, value] of Object.entries(mapping)) {
    if (value !== undefined) {
      fields.push(`${column} = $${index++}`)
      values.push(value)
    }
  }

  if (fields.length === 0) return

  fields.push(`updated_at = NOW()`)
  values.push(id, workspaceId)

  await query(
    `UPDATE subscriptions
     SET ${fields.join(', ')}
     WHERE id = $${index++} AND workspace_id = $${index}`,
    values
  )
}

export async function deleteSubscription(workspaceId: string, id: string): Promise<void> {
  await query(
    'DELETE FROM subscriptions WHERE id = $1 AND workspace_id = $2',
    [id, workspaceId]
  )
}

export async function getSharedSubscriptions(sharingUuid: string): Promise<Subscription[]> {
  const result = await query<DbSharedSubscriptionRow>(
    `SELECT * FROM shared_subscriptions WHERE sharing_uuid = $1`,
    [sharingUuid]
  )
  return result.rows.map(mapRowToSubscription)
}

export async function getSharedWorkspaceName(sharingUuid: string): Promise<string | null> {
  const result = await query<{ workspace_name: string }>(
    `SELECT workspace_name FROM shared_subscriptions
     WHERE sharing_uuid = $1
     LIMIT 1`,
    [sharingUuid]
  )
  return result.rows[0]?.workspace_name ?? null
}
