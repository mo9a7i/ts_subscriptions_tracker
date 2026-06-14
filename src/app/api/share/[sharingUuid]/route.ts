import { NextResponse } from 'next/server'
import {
  getSharedSubscriptions,
  getSharedWorkspaceName,
} from '@/lib/workspace-repository'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sharingUuid: string }> }
) {
  try {
    const { sharingUuid } = await params
    const [subscriptions, workspaceName] = await Promise.all([
      getSharedSubscriptions(sharingUuid),
      getSharedWorkspaceName(sharingUuid),
    ])

    if (!workspaceName && subscriptions.length === 0) {
      return NextResponse.json({ error: 'Sharing link not found' }, { status: 404 })
    }

    return NextResponse.json({
      workspaceName: workspaceName ?? 'Shared Workspace',
      subscriptions,
    })
  } catch (error) {
    console.error('GET /api/share/[sharingUuid]:', error)
    return NextResponse.json({ error: 'Failed to load shared workspace' }, { status: 500 })
  }
}
