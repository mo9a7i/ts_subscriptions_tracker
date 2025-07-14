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

  const thisMonthPayments = activeSubscriptions
    .filter((sub) => {
      const nextPayment = new Date(sub.nextPayment)
      const now = new Date()
      return nextPayment.getMonth() === now.getMonth() && nextPayment.getFullYear() === now.getFullYear()
    })
    .reduce((total, sub) => {
      const amountInSAR = convertToSAR(sub.amount, sub.currency)
      return total + amountInSAR
    }, 0)

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyTotal, "SAR")}</div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {filteredSubscriptions.length > 0 ? "Filtered monthly spend" : "Approximate monthly spend"}
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
            {filteredSubscriptions.length > 0 ? "Filtered payments due" : "Payments due this month"}
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
        </CardContent>
      </Card>
    </div>
  )
}
