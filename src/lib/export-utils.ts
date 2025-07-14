import * as XLSX from 'xlsx'
import type { Subscription } from '@/types'
import { formatInSAR } from '@/lib/currency'

export function exportToJSON(subscriptions: Subscription[], filename = 'subscriptions') {
  const dataStr = JSON.stringify(subscriptions, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `${filename}-${new Date().toISOString().split('T')[0]}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

export function exportToXLSX(subscriptions: Subscription[], filename = 'subscriptions') {
  // Transform data for Excel export with readable formatting
  const excelData = subscriptions.map(sub => ({
    'Service Name': sub.name,
    'Amount': sub.amount,
    'Currency': sub.currency,
    'Amount (SAR)': formatInSAR(sub.amount, sub.currency).replace('ر.س ', ''),
    'Frequency': sub.frequency,
    'Next Payment': sub.nextPayment,
    'Start Date': sub.startDate || '',
    'Website': sub.url || '',
    'Auto Renewal': sub.autoRenewal ? 'Yes' : 'No',
    'Labels': sub.labels.join(', '),
    'Comment': sub.comment || '',
    'Created': new Date(sub.createdAt).toLocaleDateString(),
    'Updated': new Date(sub.updatedAt).toLocaleDateString()
  }))

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Set column widths for better readability
  const colWidths = [
    { wch: 20 }, // Service Name
    { wch: 10 }, // Amount
    { wch: 8 },  // Currency
    { wch: 12 }, // Amount (SAR)
    { wch: 12 }, // Frequency
    { wch: 12 }, // Next Payment
    { wch: 12 }, // Start Date
    { wch: 25 }, // Website
    { wch: 12 }, // Auto Renewal
    { wch: 20 }, // Labels
    { wch: 30 }, // Comment
    { wch: 12 }, // Created
    { wch: 12 }  // Updated
  ]
  ws['!cols'] = colWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions')

  // Generate filename with date
  const exportFileDefaultName = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`

  // Write and download file
  XLSX.writeFile(wb, exportFileDefaultName)
} 