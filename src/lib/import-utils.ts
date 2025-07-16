import type { Subscription } from '@/types'
import type { WorkspaceDatabase } from '@/lib/workspace-db'

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  duplicates: string[]
}

export function validateSubscriptionData(data: any): data is Subscription {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.amount === 'number' &&
    typeof data.currency === 'string' &&
    typeof data.frequency === 'string' &&
    ['weekly', 'monthly', 'quarterly', 'yearly'].includes(data.frequency) &&
    typeof data.nextPayment === 'string' &&
    Array.isArray(data.labels) &&
    typeof data.autoRenewal === 'boolean' &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string'
  )
}

export async function importFromJSON(jsonData: string, workspaceDB: WorkspaceDatabase): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
    duplicates: []
  }

  try {
    // Parse JSON data
    let parsedData: any
    try {
      parsedData = JSON.parse(jsonData)
    } catch (error) {
      result.errors.push('Invalid JSON format')
      return result
    }

    // Ensure data is an array
    const subscriptions = Array.isArray(parsedData) ? parsedData : [parsedData]

    if (subscriptions.length === 0) {
      result.errors.push('No subscription data found')
      return result
    }

    // Get existing subscriptions to check for duplicates
    const existingSubscriptions = await workspaceDB.getAllSubscriptions()
    const existingIds = new Set(existingSubscriptions.map((sub: Subscription) => sub.id))

    // Process each subscription
    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i]

      // Validate subscription data
      if (!validateSubscriptionData(subscription)) {
        result.errors.push(`Invalid subscription data at index ${i}`)
        continue
      }

      // Check for duplicates
      if (existingIds.has(subscription.id)) {
        result.duplicates.push(subscription.name)
        result.skipped++
        continue
      }

      try {
        // Add subscription to database
        await workspaceDB.addSubscription({
          name: subscription.name,
          amount: subscription.amount,
          currency: subscription.currency,
          frequency: subscription.frequency,
          nextPayment: subscription.nextPayment,
          startDate: subscription.startDate,
          url: subscription.url,
          icon: subscription.icon,
          comment: subscription.comment,
          labels: subscription.labels,
          autoRenewal: subscription.autoRenewal
        })
        
        result.imported++
        existingIds.add(subscription.id) // Add to set to prevent duplicates within the same import
      } catch (error) {
        result.errors.push(`Failed to import "${subscription.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    result.success = result.imported > 0 || (result.skipped > 0 && result.errors.length === 0)
    return result

  } catch (error) {
    result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return result
  }
}

export function triggerFileInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.style.display = 'none'

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    }

    input.oncancel = () => reject(new Error('File selection cancelled'))
    
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
} 