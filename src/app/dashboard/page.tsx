'use client'

import { useEffect } from 'react'

// This page generates UUIDs dynamically and should not be statically generated
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { WorkspaceStorage } from '@/lib/workspace-storage'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a previous workspace
    const lastWorkspace = WorkspaceStorage.getLastWorkspace()
    
    if (lastWorkspace) {
      // Redirect to their last workspace
      router.push(`/dashboard/${lastWorkspace}`)
    } else {
      // Generate new workspace UUID
      const newUUID = crypto.randomUUID()
      WorkspaceStorage.setLastWorkspace(newUUID)
      router.push(`/dashboard/${newUUID}`)
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Setting up your workspace...</p>
      </div>
    </div>
  )
}
