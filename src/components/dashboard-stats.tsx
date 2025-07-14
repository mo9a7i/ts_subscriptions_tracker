"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Calendar, DollarSign, TrendingUp } from "lucide-react"
import type { DashboardStatsProps } from "@/types"
import { convertToSAR, formatCurrency } from "@/lib/currency"

export function DashboardStats({ subscriptions, filteredSubscriptions }: DashboardStatsProps) {
  // Use filteredSubscriptions for calculations when filters are active
  const activeSubscriptions = filteredSubscriptions.length > 0 ? filteredSubscriptions : subscriptions
  const totalSubscriptions = activeSubscriptions.length

  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    let monthlyAmount = sub.amount

    switch (sub.frequency) {
      case "weekly":
        monthlyAmount = sub.amount * 4.33
        break
      case "quarterly":
        monthlyAmount = sub.amount / 3
        break
      case "yearly":
        monthlyAmount = sub.amount / 12
        break
    }

    // Convert to SAR
    const monthlyAmountInSAR = convertToSAR(monthlyAmount, sub.currency)
    return total + monthlyAmountInSAR
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  // Calculate expected cost from today to end of month (for sub-info)
  const now = new Date()
  // Fix timezone issues by using explicit date construction
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  // Set times to avoid timezone issues
  startOfMonth.setHours(0, 0, 0, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  // Expected payments from today until end of month
  const expectedCostToEndOfMonth = activeSubscriptions
    .filter((sub) => {
      const nextPayment = new Date(sub.nextPayment)
      return nextPayment >= now && nextPayment <= endOfMonth
    })
    .reduce((total, sub) => {
      const amountInSAR = convertToSAR(sub.amount, sub.currency)
      return total + amountInSAR
    }, 0)

  // Total payments for the entire current month (1st to end of month)
  // For monthly subscriptions, include all regardless of nextPayment date
  // For other frequencies, convert to monthly equivalent
  const thisMonthPayments = monthlyTotal

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filteredSubscriptions.length > 0 ? "Filtered" : "Total"} Subscriptions
          </CardTitle>
          <CreditCard className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalSubscriptions.toLocaleString('en-US')}</div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {filteredSubscriptions.length > 0 ? "Matching filters" : "Active subscriptions"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(thisMonthPayments, "SAR")}</div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {filteredSubscriptions.length > 0 ? "Filtered payments due" : "Total payments due this month"}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Expected until month end: {formatCurrency(expectedCostToEndOfMonth, "SAR")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yearly Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(yearlyTotal, "SAR")}</div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {filteredSubscriptions.length > 0 ? "Filtered annual cost" : "Annual subscription cost"}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Monthly equivalent: {formatCurrency(monthlyTotal, "SAR")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
