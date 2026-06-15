'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/stack/hooks'
import { createMyWorkspace, listMyWorkspaces, type UserWorkspaceSummary } from '@/lib/workspace-db'
import { WorkspaceNameModal } from '@/components/workspace-name-modal'
import { LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus } from 'lucide-react'

function WorkspacesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useUser()
  const [workspaces, setWorkspaces] = useState<UserWorkspaceSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await listMyWorkspaces()
      setWorkspaces(list)
    } catch {
      setError('Failed to load your workspaces.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user === undefined) return

    if (!user) {
      router.replace('/handler/sign-in')
      return
    }

    loadWorkspaces()
  }, [user, router, loadWorkspaces])

  useEffect(() => {
    if (searchParams.get('new') === '1' && user) {
      setShowCreateModal(true)
    }
  }, [searchParams, user])

  const handleCreateWorkspace = async (name: string) => {
    setIsCreating(true)
    setError(null)
    try {
      const workspace = await createMyWorkspace(name)
      setShowCreateModal(false)
      router.push(`/dashboard/${workspace.id}`)
    } catch {
      setError('Failed to create workspace. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (user === undefined || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner text="Loading your workspaces..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Switch between your subscription trackers or create a new one.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <FolderOpen className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No workspaces yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first workspace to start tracking subscriptions.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link
                href={`/dashboard/${workspace.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-4 hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last opened{' '}
                    {workspace.lastAccessedAt
                      ? new Date(workspace.lastAccessedAt).toLocaleDateString()
                      : new Date(workspace.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-primary">Open</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <WorkspaceNameModal
        isOpen={showCreateModal}
        onConfirm={handleCreateWorkspace}
        isCreating={isCreating}
      />
    </div>
  )
}

export default function WorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <LoadingSpinner text="Loading your workspaces..." />
        </div>
      }
    >
      <WorkspacesPageContent />
    </Suspense>
  )
}
