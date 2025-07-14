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
  createdAt: string
  updatedAt: string
}

export interface Label {
  id: string
  name: string
  color: string
  createdAt: string
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
}

// Sorting Types
export type SortOption = "nextPayment" | "name" | "amount"
export type SortOrder = "asc" | "desc"

// Component Props Types
export interface SubscriptionModalProps {
  subscription?: Subscription
  onSave: () => void
  trigger?: React.ReactNode
}

export interface SubscriptionListProps {
  subscriptions: Subscription[]
  onUpdate: () => void
  selectedLabels: string[]
  sortBy: SortOption
  sortOrder: SortOrder
}

export interface DashboardStatsProps {
  subscriptions: Subscription[]
  filteredSubscriptions: Subscription[]
}

export interface SidebarProps {
  selectedLabels: string[]
  onLabelsChange: (labels: string[]) => void
}

// Utility Types
export type CreateSubscriptionData = Omit<Subscription, "id" | "createdAt" | "updatedAt">
export type UpdateSubscriptionData = Partial<Subscription>
export type CreateLabelData = Omit<Label, "id" | "createdAt"> 