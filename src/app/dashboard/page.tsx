"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/db"
import { DashboardStats } from "@/components/dashboard-stats"
import { SubscriptionList } from "@/components/subscription-lister"
import { SubscriptionModal } from "@/components/subscription-modal"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExportDropdown } from "@/components/export-dropdown"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Subscription, SortOption, SortOrder } from "@/types"

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("nextPayment")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  useEffect(() => {
    initializeDB()
  }, [])

  const initializeDB = async () => {
    try {
      await db.init()
      await loadSubscriptions()
    } catch (error) {
      console.error("Failed to initialize database:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubscriptions = async () => {
    try {
      const subs = await db.getAllSubscriptions()
      setSubscriptions(subs)
    } catch (error) {
      console.error("Failed to load subscriptions:", error)
    }
  }

  const filteredSubscriptions = selectedLabels.length > 0
    ? subscriptions.filter((sub) => sub.labels.some((label) => selectedLabels.includes(label)))
    : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400">Loading your subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-6  justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Subscription Tracker</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Manage and track your recurring subscriptions</p>
          </div>
          <div className="flex items-center justify-end gap-4">
            <SubscriptionModal onSave={loadSubscriptions} />
            <ThemeToggle />
          </div>
        </div>

        <DashboardStats 
          subscriptions={subscriptions} 
          filteredSubscriptions={filteredSubscriptions}
        />

        <div className="mt-8 lg:flex gap-6">
          <Sidebar 
            selectedLabels={selectedLabels}
            onLabelsChange={setSelectedLabels}
          />
          
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-6  justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedLabels.length > 0 ? "Filtered Subscriptions" : "Your Subscriptions"}
              </h2>
              <div className="flex justify-between lg:justify-end items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nextPayment">Next Payment</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </Button>
                  <ExportDropdown 
                    subscriptions={subscriptions}
                    filteredSubscriptions={filteredSubscriptions}
                    selectedLabels={selectedLabels}
                    onImportComplete={loadSubscriptions}
                  />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {(filteredSubscriptions.length > 0 ? filteredSubscriptions.length : subscriptions.length).toLocaleString('en-US')} subscriptions
                </span>
              </div>
            </div>
            
            <SubscriptionList 
              subscriptions={subscriptions}
              onUpdate={loadSubscriptions}
              selectedLabels={selectedLabels}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
