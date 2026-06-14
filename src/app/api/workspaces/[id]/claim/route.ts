import { NextResponse } from 'next/server'
import { getHexclaveServerApp } from '@/stack/server'
import { claimWorkspace } from '@/lib/workspace-repository'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getHexclaveServerApp().getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const claimed = await claimWorkspace(id, user.id)

    if (!claimed) {
      return NextResponse.json({ error: 'Workspace already claimed by another user' }, { status: 409 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/workspaces/[id]/claim:', error)
    return NextResponse.json({ error: 'Failed to claim workspace' }, { status: 500 })
  }
}
