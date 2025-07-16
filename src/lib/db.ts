import type { Subscription, CreateSubscriptionData } from "@/types"
  
  class SubscriptionDB {
    private dbName = "SubscriptionTracker"
    private version = 2
    private db: IDBDatabase | null = null
  
    async init(): Promise<void> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version)
  
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          this.db = request.result
          resolve()
        }
  
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
  
          if (!db.objectStoreNames.contains("subscriptions")) {
            const subscriptionStore = db.createObjectStore("subscriptions", { keyPath: "id" })
            subscriptionStore.createIndex("name", "name", { unique: false })
            subscriptionStore.createIndex("nextPayment", "nextPayment", { unique: false })
          }

          // Remove labels table if it exists (migration from v1 to v2)
          if (db.objectStoreNames.contains("labels")) {
            db.deleteObjectStore("labels")
          }
        }
      })
    }
  
      async addSubscription(subscription: CreateSubscriptionData): Promise<Subscription> {
    const newSubscription: Subscription = {
      ...subscription,
      autoRenewal: subscription.autoRenewal ?? true, // Default to true for backward compatibility
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  
      const transaction = this.db!.transaction(["subscriptions"], "readwrite")
      const store = transaction.objectStore("subscriptions")
      await store.add(newSubscription)
  
      return newSubscription
    }
  
      async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    const transaction = this.db!.transaction(["subscriptions"], "readwrite")
    const store = transaction.objectStore("subscriptions")
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const subscription = getRequest.result
        
        if (subscription) {
          const updatedSubscription = {
            ...subscription,
            ...updates,
            autoRenewal: subscription.autoRenewal ?? true, // Ensure backward compatibility
            id: subscription.id, // Ensure id is preserved
            updatedAt: new Date().toISOString(),
          }
          
          const putRequest = store.put(updatedSubscription)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error(`Subscription with id ${id} not found`))
        }
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }
  
    async deleteSubscription(id: string): Promise<void> {
      const transaction = this.db!.transaction(["subscriptions"], "readwrite")
      const store = transaction.objectStore("subscriptions")
      await store.delete(id)
    }
  
    async getAllSubscriptions(): Promise<Subscription[]> {
      const transaction = this.db!.transaction(["subscriptions"], "readonly")
      const store = transaction.objectStore("subscriptions")
      const request = store.getAll()
  
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }
  
      async getAllUniqueLabels(): Promise<string[]> {
    const subscriptions = await this.getAllSubscriptions()
    const allLabels = subscriptions.flatMap(sub => sub.labels || [])
    const uniqueLabels = [...new Set(allLabels)]
    return uniqueLabels.sort()
  }
  }
  
  export const db = new SubscriptionDB()

  // Migration function to ensure all subscriptions have labels array
  export async function migrateSubscriptionsLabels() {
    await db.init()
    const subscriptions = await db.getAllSubscriptions()
    
    let needsUpdate = false
    for (const subscription of subscriptions) {
      if (!Array.isArray(subscription.labels)) {
        await db.updateSubscription(subscription.id, { labels: [] })
        needsUpdate = true
      }
    }
    
    return needsUpdate
  }
  