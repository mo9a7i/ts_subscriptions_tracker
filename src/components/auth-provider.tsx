'use client'

import { HexclaveProvider, HexclaveTheme } from '@hexclave/next'
import { hexclaveClientApp } from '@/stack/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <HexclaveProvider app={hexclaveClientApp}>
      <HexclaveTheme>{children}</HexclaveTheme>
    </HexclaveProvider>
  )
}
