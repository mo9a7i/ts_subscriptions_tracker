import type { Subscription, Label, CreateSubscriptionData, CreateLabelData } from "@/types"
  
  class SubscriptionDB {
    private dbName = "SubscriptionTracker"
    private version = 1
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
  
          if (!db.objectStoreNames.contains("labels")) {
            db.createObjectStore("labels", { keyPath: "id" })
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
  
    async addLabel(label: CreateLabelData): Promise<Label> {
      const newLabel: Label = {
        ...label,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
  
      const transaction = this.db!.transaction(["labels"], "readwrite")
      const store = transaction.objectStore("labels")
      await store.add(newLabel)
  
      return newLabel
    }
  
    async getAllLabels(): Promise<Label[]> {
      const transaction = this.db!.transaction(["labels"], "readonly")
      const store = transaction.objectStore("labels")
      const request = store.getAll()
  
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }
  }
  
  export const db = new SubscriptionDB()
  