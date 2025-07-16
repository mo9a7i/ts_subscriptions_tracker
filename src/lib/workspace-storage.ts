import type { Subscription, SortOption } from '@/types'

interface SortingPreferences {
  sortBy: SortOption
}

export class WorkspaceStorage {
  private static LAST_WORKSPACE_KEY = 'lastWorkspaceId'
  private static CACHE_PREFIX = 'workspace_cache_'
  private static SORTING_PREFIX = 'sorting_pref_'
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Remember last visited workspace
  static setLastWorkspace(uuid: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.LAST_WORKSPACE_KEY, uuid)
    }
  }

  static getLastWorkspace(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.LAST_WORKSPACE_KEY)
    }
    return null
  }

  // Sorting preferences persistence
  static saveSortingPreferences(uuid: string, sortBy: SortOption): void {
    if (typeof window !== 'undefined') {
      const preferences: SortingPreferences = { sortBy }
      localStorage.setItem(
        `${this.SORTING_PREFIX}${uuid}`,
        JSON.stringify(preferences)
      )
    }
  }

  static getSortingPreferences(uuid: string): SortingPreferences | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${this.SORTING_PREFIX}${uuid}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as any
          
          // Handle legacy format (separate sortBy and sortOrder)
          if (parsed.sortBy && parsed.sortOrder && typeof parsed.sortBy === 'string' && !parsed.sortBy.includes('-')) {
            return { sortBy: `${parsed.sortBy}-${parsed.sortOrder}` as SortOption }
          }
          
          // Handle new format or already migrated
          if (parsed.sortBy && typeof parsed.sortBy === 'string') {
            return { sortBy: parsed.sortBy as SortOption }
          }
          
          // Invalid data, remove it
          localStorage.removeItem(`${this.SORTING_PREFIX}${uuid}`)
        } catch (error) {
          // Invalid data, remove it
          localStorage.removeItem(`${this.SORTING_PREFIX}${uuid}`)
        }
      }
    }
    return null
  }

  // Session cache for performance
  static cacheWorkspaceData(uuid: string, data: Subscription[]): void {
    if (typeof window !== 'undefined') {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      sessionStorage.setItem(
        `${this.CACHE_PREFIX}${uuid}`, 
        JSON.stringify(cacheData)
      )
    }
  }

  static getCachedData(uuid: string): Subscription[] | null {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`${this.CACHE_PREFIX}${uuid}`)
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached)
          // Check if cache is still valid
          if (Date.now() - timestamp < this.CACHE_DURATION) {
            return data
          } else {
            // Cache expired, remove it
            sessionStorage.removeItem(`${this.CACHE_PREFIX}${uuid}`)
          }
        } catch (error) {
          // Invalid cache data, remove it
          sessionStorage.removeItem(`${this.CACHE_PREFIX}${uuid}`)
        }
      }
    }
    return null
  }

  static invalidateCache(uuid: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${this.CACHE_PREFIX}${uuid}`)
    }
  }

  static clearAllCache(): void {
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }
} 