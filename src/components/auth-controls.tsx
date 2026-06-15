'use client'

import { Suspense } from 'react'
import { UserButton, useHexclaveApp, useUser } from '@/stack/hooks'
import { Button } from '@/components/ui/button'

function AuthControlsInner() {
  const app = useHexclaveApp()
  const user = useUser()

  if (user) {
    return <UserButton showUserInfo />
  }

  return (
    <Button variant="outline" size="sm" onClick={() => app.redirectToSignIn()}>
      Sign In
    </Button>
  )
}

export function AuthControls() {
  return (
    <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-md bg-muted" />}>
      <AuthControlsInner />
    </Suspense>
  )
}
