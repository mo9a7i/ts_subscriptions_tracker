import 'server-only'

import { NextResponse } from 'next/server'
import {
  getWorkspaceInfo,
  touchWorkspaceAccess,
  type WorkspaceInfo,
} from '@/lib/workspace-repository'
import { getOptionalUser } from '@/lib/api-auth'

export function canAccessWorkspace(
  info: WorkspaceInfo,
  userId: string | null
): boolean {
  if (info.isAnonymous) return true
  return userId !== null && info.userId === userId
}

export async function resolveWorkspaceAccess(workspaceId: string) {
  const info = await getWorkspaceInfo(workspaceId)

  if (!info) {
    return {
      info: null as null,
      user: await getOptionalUser(),
      denial: NextResponse.json({ error: 'Not found', exists: false }, { status: 404 }),
    }
  }

  const user = await getOptionalUser()

  if (!canAccessWorkspace(info, user?.id ?? null)) {
    return {
      info,
      user,
      denial: NextResponse.json(
        { error: 'Forbidden', exists: true, forbidden: true },
        { status: 403 }
      ),
    }
  }

  if (user && info.userId === user.id) {
    await touchWorkspaceAccess(workspaceId, user.id)
  }

  return { info, user, denial: null as null }
}
