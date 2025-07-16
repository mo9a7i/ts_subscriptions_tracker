"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPaymentDatesForMonth, formatDateKey } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/currency"
import type { Subscription } from "@/types"

interface PaymentCalendarProps {
  subscriptions: Subscription[]
  filteredSubscriptions?: Subscription[]
}

interface PaymentInfo {
  name: string
  amount: number
  currency: string
}

export function PaymentCalendar({ subscriptions, filteredSubscriptions = [] }: PaymentCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [month, setMonth] = useState(new Date()); // Start from October 2024


  // Use filtered subscriptions if available, otherwise use all subscriptions
  const activeSubscriptions = filteredSubscriptions.length > 0 ? filteredSubscriptions : subscriptions

  // Get payment dates for current month
  const paymentDates = getPaymentDatesForMonth(
    activeSubscriptions,
    currentDate.getFullYear(),
    currentDate.getMonth()
  )




  // Create modifiers for payment dates
  const modifiers = {
    hasPayment: (date: Date) => {
      const dateKey = formatDateKey(date)
      return paymentDates.has(dateKey)
    }
  }

  return (
    <Card>
      <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Payment Calendar
          </CardTitle>
     
      </CardHeader>
      <CardContent className="items-center justify-center flex">
      
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={modifiers}
            className="border-0 p-0"
            modifiersClassNames={{
              hasPayment: "bg-red-500/20 rounded-md text-red-500 hover:bg-red-500/30 font-semibold"
            }}
           
          />


      </CardContent>
    </Card>
  )
} 