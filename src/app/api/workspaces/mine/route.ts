import { NextResponse } from 'next/server'
import {
  getWorkspacesByUserId,
  createOwnedWorkspace,
} from '@/lib/workspace-repository'
import { requireUser } from '@/lib/api-auth'

export async function GET() {
  try {
    const { user, error } = await requireUser()
    if (error) return error

    const workspaces = await getWorkspacesByUserId(user.id)
    return NextResponse.json({ workspaces })
  } catch (err) {
    console.error('GET /api/workspaces/mine:', err)
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireUser()
    if (error) return error

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name : undefined

    const workspace = await createOwnedWorkspace(user.id, name)
    return NextResponse.json(workspace, { status: 201 })
  } catch (err) {
    console.error('POST /api/workspaces/mine:', err)
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
  }
}
