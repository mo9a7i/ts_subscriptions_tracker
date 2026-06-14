import { NextResponse } from 'next/server'
import { updateSubscription, deleteSubscription } from '@/lib/workspace-repository'
import type { Subscription } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  try {
    const { id, subscriptionId } = await params
    const updates = (await request.json()) as Partial<Subscription>
    await updateSubscription(id, subscriptionId, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/workspaces/[id]/subscriptions/[subscriptionId]:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  try {
    const { id, subscriptionId } = await params
    await deleteSubscription(id, subscriptionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/workspaces/[id]/subscriptions/[subscriptionId]:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
