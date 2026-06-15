import { NextResponse } from 'next/server'
import { updateSubscription, deleteSubscription } from '@/lib/workspace-repository'
import { resolveWorkspaceAccess } from '@/lib/workspace-access'
import type { Subscription } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  try {
    const { id, subscriptionId } = await params
    const { denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

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
    const { denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    await deleteSubscription(id, subscriptionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/workspaces/[id]/subscriptions/[subscriptionId]:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
