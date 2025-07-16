// Exchange rates to SAR (Saudi Riyal)
const EXCHANGE_RATES: Record<string, number> = {
  SAR: 1,
  USD: 3.75,
  EUR: 4.1,
  GBP: 4.8,
  CAD: 2.8,
}

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: "ر.س",
  USD: "$",
  EUR: "€", 
  GBP: "£",
  CAD: "C$",
}

export function convertToSAR(amount: number, fromCurrency: string): number {
  const rate = EXCHANGE_RATES[fromCurrency] || 1
  return amount * rate
}

export function formatCurrency(amount: number, currency: string = "SAR"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${symbol} ${formattedAmount} `
}

export function formatInSAR(amount: number, fromCurrency: string): string {
  const sarAmount = convertToSAR(amount, fromCurrency)
  return formatCurrency(sarAmount, "SAR")
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
} 