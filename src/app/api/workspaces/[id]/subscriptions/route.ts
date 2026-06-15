import { NextResponse } from 'next/server'
import {
  getSubscriptions,
  addSubscription,
} from '@/lib/workspace-repository'
import { resolveWorkspaceAccess } from '@/lib/workspace-access'
import type { CreateSubscriptionData } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    const subscriptions = await getSubscriptions(id)
    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('GET /api/workspaces/[id]/subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    const body = (await request.json()) as CreateSubscriptionData
    const subscription = await addSubscription(id, body)
    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('POST /api/workspaces/[id]/subscriptions:', error)
    return NextResponse.json({ error: 'Failed to add subscription' }, { status: 500 })
  }
}
