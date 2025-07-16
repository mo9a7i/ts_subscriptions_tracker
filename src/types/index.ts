// Database Types
export interface Subscription {
  id: string
  name: string
  amount: number
  currency: string
  frequency: "monthly" | "yearly" | "weekly" | "quarterly"
  nextPayment: string
  startDate?: string
  url?: string
  icon?: string
  comment?: string
  labels: string[]
  autoRenewal: boolean
  colors?: {
    Vibrant?: string
    Muted?: string
    DarkVibrant?: string
    DarkMuted?: string
    LightVibrant?: string
    LightMuted?: string
  }
  createdAt: string
  updatedAt: string
}



// Form Types
export type SubscriptionFrequency = "weekly" | "monthly" | "quarterly" | "yearly"

export interface SubscriptionFormData {
  name: string
  amount: string
  currency: string
  frequency: SubscriptionFrequency
  nextPayment: string
  startDate: string
  url: string
  icon: string
  comment: string
  labels: string[]
  autoRenewal: boolean
  colors?: {
    Vibrant?: string
    Muted?: string
    DarkVibrant?: string
    DarkMuted?: string
    LightVibrant?: string
    LightMuted?: string
  }
}

// Sorting Types
export type SortOption = "nextPayment-asc" | "nextPayment-desc" | "name-asc" | "name-desc" | "amount-asc" | "amount-desc"
// Remove the SortOrder type as it's now integrated into SortOption

// Component Props Types
export interface SubscriptionModalProps {
  subscription?: Subscription
  onSave: () => void
  trigger?: React.ReactNode
  workspaceDB?: any // WorkspaceDatabase type will be imported when used
  onDeleteStart?: () => void
  onDeleteEnd?: () => void
}

export interface SubscriptionListProps {
  subscriptions: Subscription[]
  onUpdate: () => void
  selectedLabels: string[]
  sortBy: SortOption
  workspaceDB?: any // WorkspaceDatabase type will be imported when used
  readonly?: boolean
}

export interface DashboardStatsProps {
  subscriptions: Subscription[]
  filteredSubscriptions: Subscription[]
}

export interface SidebarProps {
  selectedLabels: string[]
  onLabelsChange: (labels: string[]) => void
  subscriptions: Subscription[]
  filteredSubscriptions: Subscription[]
  workspaceDB?: any // WorkspaceDatabase type will be imported when used
}

// Utility Types
export type CreateSubscriptionData = Omit<Subscription, "id" | "createdAt" | "updatedAt">
export type UpdateSubscriptionData = Partial<Subscription>
 