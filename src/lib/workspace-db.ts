import { supabase, type SupabaseSubscription, type SupabaseWorkspace } from './supabase'
import { WorkspaceStorage } from './workspace-storage'
import type { Subscription, CreateSubscriptionData } from '@/types'

export class WorkspaceDatabase {
  constructor(private workspaceId: string) {}

  // Initialize workspace if it doesn't exist
  async initializeWorkspace(customName?: string): Promise<void> {
    try {
      // Check if workspace exists
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', this.workspaceId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Workspace doesn't exist, create it
        const { error: insertError } = await supabase
          .from('workspaces')
          .insert({
            id: this.workspaceId,
            name: customName || 'My Subscriptions',
            is_anonymous: true
          })

        if (insertError) {
          console.error('Error creating workspace:', insertError)
          throw insertError
        }
      } else if (error) {
        console.error('Error checking workspace:', error)
        throw error
      }
    } catch (error) {
      console.error('Error initializing workspace:', error)
      throw error
    }
  }

  // Check if workspace exists (without creating it)
  async workspaceExists(): Promise<boolean> {
    try {
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', this.workspaceId)
        .single()

      if (error && error.code === 'PGRST116') {
        return false; // Workspace doesn't exist
      } else if (error) {
        console.error('Error checking workspace:', error)
        throw error
      }
      
      return true; // Workspace exists
    } catch (error) {
      console.error('Error checking workspace existence:', error)
      throw error
    }
  }

  // Get all subscriptions for this workspace
  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      // Try cache first for instant loading
      const cached = WorkspaceStorage.getCachedData(this.workspaceId)
      if (cached) {
        // Return cached data immediately, refresh in background
        this.refreshCacheInBackground()
        return cached
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', this.workspaceId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching subscriptions:', error)
        throw error
      }

      const subscriptions = this.mapSupabaseToLocal(data || [])
      
      // Cache the results
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, subscriptions)
      
      return subscriptions
    } catch (error) {
      console.error('Error getting subscriptions:', error)
      throw error
    }
  }

  // Add new subscription
  async addSubscription(subscription: CreateSubscriptionData): Promise<Subscription> {
    try {
      await this.initializeWorkspace()

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          workspace_id: this.workspaceId,
          name: subscription.name,
          amount: subscription.amount,
          currency: subscription.currency,
          frequency: subscription.frequency,
          next_payment: subscription.nextPayment,
          start_date: subscription.startDate || null,
          url: subscription.url || null,
          icon: subscription.icon || null,
          comment: subscription.comment || null,
          labels: subscription.labels || [],
          auto_renewal: subscription.autoRenewal ?? true,
          colors: subscription.colors || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding subscription:', error)
        throw error
      }

      const newSubscription = this.mapSupabaseToLocal([data])[0]
      
      // Optimistic update: add to cache immediately
      this.addToCache(newSubscription)
      
      return newSubscription
    } catch (error) {
      console.error('Error adding subscription:', error)
      throw error
    }
  }

  // Update subscription
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    try {
      const updateData: any = {}
      
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.currency !== undefined) updateData.currency = updates.currency
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency
      if (updates.nextPayment !== undefined) updateData.next_payment = updates.nextPayment
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate
      if (updates.url !== undefined) updateData.url = updates.url
      if (updates.icon !== undefined) updateData.icon = updates.icon
      if (updates.comment !== undefined) updateData.comment = updates.comment
      if (updates.labels !== undefined) updateData.labels = updates.labels
      if (updates.autoRenewal !== undefined) updateData.auto_renewal = updates.autoRenewal
      if (updates.colors !== undefined) updateData.colors = updates.colors

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .eq('workspace_id', this.workspaceId)

      if (error) {
        console.error('Error updating subscription:', error)
        throw error
      }

      // Optimistic update: update in cache immediately
      this.updateInCache(id, updates)
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  // Delete subscription
  async deleteSubscription(id: string): Promise<void> {
    try {
      // Optimistic update: remove from cache immediately
      this.removeFromCache(id)
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('workspace_id', this.workspaceId)

      if (error) {
        console.error('Error deleting subscription:', error)
        // Revert optimistic update on error
        WorkspaceStorage.invalidateCache(this.workspaceId)
        throw error
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
      throw error
    }
  }

  // Get cached subscriptions synchronously (for instant UI updates)
  getCachedSubscriptions(): Subscription[] | null {
    return WorkspaceStorage.getCachedData(this.workspaceId)
  }

  // Get all unique labels for this workspace
  async getAllUniqueLabels(): Promise<string[]> {
    try {
      // Try cache first to avoid unnecessary Supabase calls
      const cached = this.getCachedSubscriptions();
      const subscriptions = cached || await this.getAllSubscriptions();
      
      const allLabels = subscriptions.flatMap(sub => sub.labels || [])
      const uniqueLabels = [...new Set(allLabels)]
      return uniqueLabels.sort()
    } catch (error) {
      console.error('Error getting unique labels:', error)
      return []
    }
  }

  // Private methods
  private async refreshCacheInBackground(): Promise<void> {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', this.workspaceId)
        .order('created_at', { ascending: false })

      if (data) {
        const subscriptions = this.mapSupabaseToLocal(data)
        WorkspaceStorage.cacheWorkspaceData(this.workspaceId, subscriptions)
      }
    } catch (error) {
      console.warn('Background cache refresh failed:', error)
    }
  }

  private mapSupabaseToLocal(data: SupabaseSubscription[]): Subscription[] {
    return data.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      currency: item.currency,
      frequency: item.frequency,
      nextPayment: item.next_payment,
      startDate: item.start_date || undefined,
      url: item.url || undefined,
      icon: item.icon || undefined,
      comment: item.comment || undefined,
      labels: item.labels || [],
      autoRenewal: item.auto_renewal,
      colors: item.colors || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  }

  // Private methods for optimistic cache updates
  private removeFromCache(id: string): void {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      const filtered = cached.filter(sub => sub.id !== id)
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, filtered)
    }
  }

  private addToCache(subscription: Subscription): void {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      const updated = [subscription, ...cached]
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, updated)
    }
  }

  private updateInCache(id: string, updates: Partial<Subscription>): void {
    const cached = WorkspaceStorage.getCachedData(this.workspaceId)
    if (cached) {
      const updated = cached.map(sub => 
        sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
      )
      WorkspaceStorage.cacheWorkspaceData(this.workspaceId, updated)
    }
  }

  // Generate or get sharing UUID for this workspace
  async generateSharingLink(): Promise<string> {
    try {
      // Check if workspace already has a sharing UUID
      const { data: workspace, error: fetchError } = await supabase
        .from('workspaces')
        .select('sharing_uuid')
        .eq('id', this.workspaceId)
        .single()

      if (fetchError) {
        console.error('Error fetching workspace:', fetchError)
        throw fetchError
      }

      // If sharing UUID already exists, return it
      if (workspace.sharing_uuid) {
        return workspace.sharing_uuid
      }

      // Generate new sharing UUID
      const sharingUUID = crypto.randomUUID()

      // Update workspace with sharing UUID
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({ sharing_uuid: sharingUUID })
        .eq('id', this.workspaceId)

      if (updateError) {
        console.error('Error updating workspace with sharing UUID:', updateError)
        throw updateError
      }

      return sharingUUID
    } catch (error) {
      console.error('Error generating sharing link:', error)
      throw error
    }
  }

  // Get sharing UUID for this workspace (if it exists)
  async getSharingUUID(): Promise<string | null> {
    try {
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('sharing_uuid')
        .eq('id', this.workspaceId)
        .single()

      if (error) {
        console.error('Error fetching sharing UUID:', error)
        return null
      }

      return workspace.sharing_uuid
    } catch (error) {
      console.error('Error getting sharing UUID:', error)
      return null
    }
  }

  // Get workspace name
  async getWorkspaceName(): Promise<string> {
    try {
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', this.workspaceId)
        .single()

      if (error) {
        console.error('Error fetching workspace name:', error)
        return 'My Subscriptions' // fallback
      }

      return workspace.name
    } catch (error) {
      console.error('Error getting workspace name:', error)
      return 'My Subscriptions' // fallback
    }
  }
}

// Factory function to create workspace database instances
export function createWorkspaceDB(workspaceId: string): WorkspaceDatabase {
  return new WorkspaceDatabase(workspaceId)
}

// Get shared subscriptions using sharing UUID (no workspace ID exposure)
export async function getSharedSubscriptions(sharingUUID: string): Promise<Subscription[]> {
  try {
    const { data: sharedSubscriptions, error } = await supabase
      .from('shared_subscriptions')
      .select('*')
      .eq('sharing_uuid', sharingUUID)

    if (error) {
      console.error('Error fetching shared subscriptions:', error)
      return []
    }

    if (!sharedSubscriptions || sharedSubscriptions.length === 0) {
      return []
    }

    // Transform to frontend format
    return sharedSubscriptions.map((sub: any): Subscription => ({
      id: sub.id,
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      frequency: sub.frequency as "weekly" | "monthly" | "quarterly" | "yearly",
      nextPayment: sub.next_payment,
      startDate: sub.start_date,
      url: sub.url,
      icon: sub.icon,
      comment: sub.comment,
      labels: sub.labels || [],
      autoRenewal: sub.auto_renewal,
      colors: sub.colors,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at
    }))
  } catch (error) {
    console.error('Error in getSharedSubscriptions:', error)
    return []
  }
}

// Get shared workspace name using sharing UUID
export async function getSharedWorkspaceName(sharingUUID: string): Promise<string | null> {
  try {
    const { data: workspace, error } = await supabase
      .from('shared_subscriptions')
      .select('workspace_name')
      .eq('sharing_uuid', sharingUUID)
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching shared workspace name:', error)
      return null
    }

    return workspace.workspace_name
  } catch (error) {
    console.error('Error in getSharedWorkspaceName:', error)
    return null
  }
} 