import { NextResponse } from 'next/server'
import {
  workspaceExists,
  initializeWorkspace,
} from '@/lib/workspace-repository'
import { resolveWorkspaceAccess } from '@/lib/workspace-access'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { info, denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    return NextResponse.json({
      exists: true,
      name: info!.name,
      isAnonymous: info!.isAnonymous,
    })
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
    const exists = await workspaceExists(id)

    if (exists) {
      const { info, denial } = await resolveWorkspaceAccess(id)
      if (denial) return denial

      return NextResponse.json({
        exists: true,
        name: info!.name,
        isAnonymous: info!.isAnonymous,
      })
    }

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name : undefined

    await initializeWorkspace(id, name)
    const { info, denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    return NextResponse.json({
      exists: true,
      name: info!.name,
      isAnonymous: info!.isAnonymous,
    })
  } catch (error) {
    console.error('POST /api/workspaces/[id]:', error)
    return NextResponse.json({ error: 'Failed to initialize workspace' }, { status: 500 })
  }
}
