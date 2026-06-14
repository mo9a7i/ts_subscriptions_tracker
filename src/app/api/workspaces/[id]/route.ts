import { NextResponse } from 'next/server'
import {
  workspaceExists,
  initializeWorkspace,
  getWorkspaceName,
} from '@/lib/workspace-repository'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const exists = await workspaceExists(id)
    if (!exists) {
      return NextResponse.json({ exists: false }, { status: 404 })
    }

    const name = await getWorkspaceName(id)
    return NextResponse.json({ exists: true, name })
  } catch (error) {
    console.error('GET /api/workspaces/[id]:', error)
    return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name : undefined

    await initializeWorkspace(id, name)
    const workspaceName = await getWorkspaceName(id)

    return NextResponse.json({ exists: true, name: workspaceName })
  } catch (error) {
    console.error('POST /api/workspaces/[id]:', error)
    return NextResponse.json({ error: 'Failed to initialize workspace' }, { status: 500 })
  }
}
