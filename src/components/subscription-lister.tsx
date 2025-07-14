"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ExternalLink, Trash2, RotateCcw } from "lucide-react"
import { db } from "@/lib/db"
import { SubscriptionModal } from "@/components/subscription-modal"
import { formatCurrency, formatInSAR, getCurrencySymbol } from "@/lib/currency"
import { formatNextPayment, getNextPaymentDate, isPaymentOverdue } from "@/lib/date-utils"
import { getBestColorForBackground } from "@/lib/color-utils"
import type { Subscription, SubscriptionListProps } from "@/types"

export function SubscriptionList({ subscriptions, onUpdate, selectedLabels, sortBy, sortOrder }: SubscriptionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Check and update overdue subscriptions when component loads or subscriptions change
  useEffect(() => {
    const checkOverdueSubscriptions = async () => {
      let hasUpdates = false
      for (const subscription of subscriptions) {
        if (isPaymentOverdue(subscription.nextPayment) && subscription.autoRenewal !== false) {
          const newNextPayment = getNextPaymentDate(subscription.nextPayment, subscription.frequency)
          if (newNextPayment !== subscription.nextPayment) {
            await db.updateSubscription(subscription.id, { nextPayment: newNextPayment })
            hasUpdates = true
          }
        }
      }
      if (hasUpdates) {
        onUpdate() // Refresh the list once after all updates
      }
    }

    if (subscriptions.length > 0) {
      checkOverdueSubscriptions()
    }
  }, [subscriptions.length]) // Only run when subscriptions array length changes

  const filteredSubscriptions =
    selectedLabels.length > 0
      ? subscriptions.filter((sub) => sub.labels.some((label) => selectedLabels.includes(label)))
      : subscriptions

  // Sort subscriptions
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case "nextPayment":
        comparison = new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime()
        break
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "amount":
        // Convert to SAR for fair comparison
        const aAmountSAR = a.amount * (a.currency === "USD" ? 3.75 : a.currency === "EUR" ? 4.1 : a.currency === "GBP" ? 4.8 : a.currency === "CAD" ? 2.8 : 1)
        const bAmountSAR = b.amount * (b.currency === "USD" ? 3.75 : b.currency === "EUR" ? 4.1 : b.currency === "GBP" ? 4.8 : b.currency === "CAD" ? 2.8 : 1)
        comparison = aAmountSAR - bAmountSAR
        break
    }
    
    return sortOrder === "desc" ? -comparison : comparison
  })

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await db.deleteSubscription(id)
    onUpdate()
    setDeletingId(null)
  }

  // Function to update subscription with next payment date if overdue
  const updateNextPaymentIfNeeded = async (subscription: Subscription) => {
    if (isPaymentOverdue(subscription.nextPayment) && subscription.autoRenewal !== false) {
      const newNextPayment = getNextPaymentDate(subscription.nextPayment, subscription.frequency)
      if (newNextPayment !== subscription.nextPayment) {
        await db.updateSubscription(subscription.id, { nextPayment: newNextPayment })
        onUpdate() // Refresh the list
      }
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "monthly":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "quarterly":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "yearly":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-1 lg:space-y-2">
      {sortedSubscriptions.map((subscription) => {
        const backgroundColorOverlay = subscription.colors ? getBestColorForBackground(subscription.colors) : null
        
        return (
          <Card key={subscription.id} className="relative rounded-md border-0 py-4 overflow-hidden">
            {backgroundColorOverlay && (
              <div 
                className="absolute inset-0 opacity-40"
                style={{ backgroundColor: backgroundColorOverlay }}
              />
            )}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-white/20 to-black/10 dark:from-white/10 dark:to-black/10"
            />
            <CardContent className="px-4 py-0 relative z-10">
              <div className="gap-2 flex flex-col lg:flex-row items-start justify-between">
                <div className="flex items-start gap-2 lg:gap-4 flex-1">
                  {subscription.icon && (
                    <div className="lg:w-10 lg:h-10 w-6 h-6 rounded-lg flex items-center justify-center  flex-shrink-0">
                      {subscription.icon.startsWith("data:") || subscription.icon.startsWith("http") ? (
                        <img
                          src={subscription.icon || "/placeholder.svg"}
                          alt={subscription.name}
                          className="lg:w-10 lg:h-10 w-6 h-6 rounded"
                        />
                      ) : (
                        <span className="text-lg">{subscription.icon}</span>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold truncate">{subscription.name}</h3>
                      <div className="flex items-center gap-2">
                        
                        <Badge className={getFrequencyColor(subscription.frequency)}>{subscription.frequency}</Badge>
                      </div>
                    </div>

                      <div className="flex items-center gap-4 text-sm text-neutral-700 dark:text-neutral-400">
                      <div className="text-right flex items-center gap-2">
                          <div className="font-bold whitespace-nowrap">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </div>
                          {subscription.currency !== "SAR" && (
                            <div className="text-xs text-neutral-700 dark:text-neutral-400">
                              ≈ {formatInSAR(subscription.amount, subscription.currency)}
                            </div>
                          )}
                        </div>
                                               <div className="flex items-center gap-2">
                           <span>{formatNextPayment(subscription.nextPayment, subscription.frequency)}</span>
                           {isPaymentOverdue(subscription.nextPayment) && subscription.autoRenewal === false && (
                             <Badge variant="destructive" className="text-xs">Overdue</Badge>
                           )}
                         </div>

                        {subscription.autoRenewal !== false && (
                          <div className="flex items-center gap-1 text-green-800 dark:text-green-400">
                            <RotateCcw className="w-3 h-3" />
                            <span className="text-xs">Auto</span>
                          </div>
                        )}

                        {subscription.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {subscription.labels.map((label) => (
                              <Badge key={label} className="text-xs border-0 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {subscription.comment && <span className="truncate max-w-xs">{subscription.comment}</span>}
                      </div>
                  </div>
                </div>

                <div className="justify-end flex self-end items-center gap-1 lg:gap-2 flex-shrink-0">
                  {subscription.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={subscription.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="lg:w-3 lg:h-3 w-2 h-2" />
                      </a>
                    </Button>
                  )}

                  <SubscriptionModal
                    subscription={subscription}
                    onSave={onUpdate}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="lg:w-4 lg:h-4 w-3 h-3" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subscription.id)}
                    disabled={deletingId === subscription.id}
                  >
                    <Trash2 className="lg:w-4 lg:h-4 w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
