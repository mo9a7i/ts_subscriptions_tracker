import { NextResponse } from 'next/server'
import { generateSharingLink, getSharingUuid } from '@/lib/workspace-repository'
import { resolveWorkspaceAccess } from '@/lib/workspace-access'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    const sharingUuid = await getSharingUuid(id)
    return NextResponse.json({ sharingUuid })
  } catch (error) {
    console.error('GET /api/workspaces/[id]/share:', error)
    return NextResponse.json({ error: 'Failed to fetch sharing UUID' }, { status: 500 })
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { denial } = await resolveWorkspaceAccess(id)
    if (denial) return denial

    const sharingUuid = await generateSharingLink(id)
    return NextResponse.json({ sharingUuid })
  } catch (error) {
    console.error('POST /api/workspaces/[id]/share:', error)
    return NextResponse.json({ error: 'Failed to generate sharing link' }, { status: 500 })
  }
}
