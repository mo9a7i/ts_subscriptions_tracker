import type { SubscriptionFrequency } from "@/types"

export function addTimeToDate(date: Date, frequency: SubscriptionFrequency): Date {
  const newDate = new Date(date)
  
  switch (frequency) {
    case "weekly":
      newDate.setDate(newDate.getDate() + 7)
      break
    case "monthly":
      newDate.setMonth(newDate.getMonth() + 1)
      break
    case "quarterly":
      newDate.setMonth(newDate.getMonth() + 3)
      break
    case "yearly":
      newDate.setFullYear(newDate.getFullYear() + 1)
      break
  }
  
  return newDate
}

export function getNextPaymentDate(currentPaymentDate: string, frequency: SubscriptionFrequency): string {
  const paymentDate = new Date(currentPaymentDate)
  const now = new Date()
  
  // If the payment date hasn't passed yet, return it as is
  if (paymentDate > now) {
    return currentPaymentDate
  }
  
  // Calculate the next payment date by adding cycles until we get a future date
  let nextPaymentDate = new Date(paymentDate)
  while (nextPaymentDate <= now) {
    nextPaymentDate = addTimeToDate(nextPaymentDate, frequency)
  }
  
  return nextPaymentDate.toISOString().split('T')[0] // Return in YYYY-MM-DD format
}

export function formatNextPayment(date: string, frequency: SubscriptionFrequency): string {
  const nextPaymentDate = getNextPaymentDate(date, frequency)
  const paymentDate = new Date(nextPaymentDate)
  const now = new Date()
  const diffTime = paymentDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`
  } else if (diffDays === 0) {
    return "Due today"
  } else if (diffDays === 1) {
    return "Due tomorrow"
  } else {
    return `Due in ${diffDays} days`
  }
}

export function isPaymentOverdue(date: string): boolean {
  const paymentDate = new Date(date)
  const now = new Date()
  return paymentDate < now
} 