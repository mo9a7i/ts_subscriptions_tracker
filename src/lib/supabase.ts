import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface SupabaseWorkspace {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id: string | null
  is_anonymous: boolean
  settings: any
  sharing_uuid: string | null
}

export interface SupabaseSubscription {
  id: string
  workspace_id: string
  name: string
  amount: number
  currency: string
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  next_payment: string
  start_date: string | null
  url: string | null
  icon: string | null
  comment: string | null
  labels: string[]
  auto_renewal: boolean
  colors: any
  created_at: string
  updated_at: string
} 