'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/stack/hooks'
import { WorkspaceStorage } from '@/lib/workspace-storage'
import { listMyWorkspaces } from '@/lib/workspace-db'
import { LoadingSpinner } from '@/components/common'

export const dynamic = 'force-dynamic'

export default function DashboardRedirect() {
  const router = useRouter()
  const user = useUser()

  useEffect(() => {
    if (user === undefined) return

    async function redirect() {
      if (user) {
        try {
          const workspaces = await listMyWorkspaces()
          if (workspaces.length > 0) {
            router.replace(`/dashboard/${workspaces[0].id}`)
          } else {
            router.replace('/workspaces?new=1')
          }
        } catch {
          router.replace('/workspaces')
        }
        return
      }

      const lastWorkspace = WorkspaceStorage.getLastWorkspace()
      if (lastWorkspace) {
        router.replace(`/dashboard/${lastWorkspace}`)
      } else {
        const newUUID = crypto.randomUUID()
        WorkspaceStorage.setLastWorkspace(newUUID)
        router.replace(`/dashboard/${newUUID}`)
      }
    }

    redirect()
  }, [router, user])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner text="Setting up your workspace..." />
    </div>
  )
}
