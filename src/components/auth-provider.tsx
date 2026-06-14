'use client'

import { HexclaveProvider } from '@hexclave/next'
import { hexclaveClientApp } from '@/stack/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <HexclaveProvider app={hexclaveClientApp}>
      {children}
    </HexclaveProvider>
  )
}
