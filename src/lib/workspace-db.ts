import { WorkspaceStorage } from './workspace-storage'
import type { Subscription, CreateSubscriptionData } from '@/types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export class WorkspaceDatabase {
  constructor(private workspaceId: string) {}

  private baseUrl = `/api/workspaces/${this.workspaceId}`

  async initializeWorkspace(customName?: string): Promise<void> {
    await apiFetch(`${this.baseUrl}`, {
      method: 'POST',
      body: JSON.stringify({ name: customName }),
    })
  }

  async workspaceExists(): Promise<boolean> {
    try {
      const result = await apiFetch<{ exists: boolean }>(`${this.baseUrl}`)
      return result.exists
    } catch {
      return false
    }
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      this.refreshCacheInBackground()
      return cached
    }

    const subscriptions = await apiFetch<Subscription[]>(`${this.baseUrl}/subscriptions`)
    WorkspaceStorage.cacheWorkspaceData(this.workspaceId, subscriptions)
    return subscriptions
  }

  async addSubscription(subscription: CreateSubscriptionData): Promise<Subscription> {
    const newSubscription = await apiFetch<Subscription>(`${this.baseUrl}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(subscription),
    })

    this.addToCache(newSubscription)
    return newSubscription
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    await apiFetch(`${this.baseUrl}/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })

    this.updateInCache(id, updates)
  }

  async deleteSubscription(id: string): Promise<void> {
    this.removeFromCache(id)

    try {
      await apiFetch(`${this.baseUrl}/subscriptions/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      WorkspaceStorage.invalidateCache(this.workspaceId)
      throw error
    }
  }

  getCachedSubscriptions(): Subscription[] | null {
    return WorkspaceStorage.getCachedData(this.workspaceId)
  }

  async getAllUniqueLabels(): Promise<string[]> {
    const cached = this.getCachedSubscriptions()
    const subscriptions = cached || await this.getAllSubscriptions()
    const allLabels = subscriptions.flatMap(sub => sub.labels || [])
    return [...new Set(allLabels)].sort()
  }

  private async refreshCacheInBackground(): Promise<void> {
    try {
      const subscriptions = await apiFetch<Subscription[]>(`${this.baseUrl}/subscriptions`)
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, subscriptions)
    } catch (error) {
      console.warn('Background cache refresh failed:', error)
    }
  }

  private removeFromCache(id: string): void {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      WorkspaceStorage.cacheWorkspaceData(
        this.workspaceId,
        cached.filter(sub => sub.id !== id)
      )
    }
  }

  private addToCache(subscription: Subscription): void {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, [subscription, ...cached])
    }
  }

  private updateInCache(id: string, updates: Partial<Subscription>): void {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      const updated = cached.map(sub =>
        sub.id === id
          ? { ...sub, ...updates, updatedAt: new Date().toISOString() }
          : sub
      )
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, updated)
    }
  }

  async generateSharingLink(): Promise<string> {
    const result = await apiFetch<{ sharingUuid: string }>(`${this.baseUrl}/share`, {
      method: 'POST',
    })
    return result.sharingUuid
  }

  async getSharingUUID(): Promise<string | null> {
    const result = await apiFetch<{ sharingUuid: string | null }>(`${this.baseUrl}/share`)
    return result.sharingUuid
  }

  async getWorkspaceName(): Promise<string> {
    try {
      const result = await apiFetch<{ name: string }>(`${this.baseUrl}`)
      return result.name
    } catch {
      return 'My Subscriptions'
    }
  }

  async claimWorkspace(): Promise<boolean> {
    try {
      await apiFetch(`${this.baseUrl}/claim`, { method: 'POST' })
      return true
    } catch {
      return false
    }
  }
}

export function createWorkspaceDB(workspaceId: string): WorkspaceDatabase {
  return new WorkspaceDatabase(workspaceId)
}

export async function getSharedSubscriptions(sharingUUID: string): Promise<Subscription[]> {
  try {
    const result = await apiFetch<{ subscriptions: Subscription[] }>(`/api/share/${sharingUUID}`)
    return result.subscriptions
  } catch (error) {
    console.error('Error in getSharedSubscriptions:', error)
    return []
  }
}

export async function getSharedWorkspaceName(sharingUUID: string): Promise<string | null> {
  try {
    const result = await apiFetch<{ workspaceName: string }>(`/api/share/${sharingUUID}`)
    return result.workspaceName
  } catch (error) {
    console.error('Error in getSharedWorkspaceName:', error)
    return null
  }
}
