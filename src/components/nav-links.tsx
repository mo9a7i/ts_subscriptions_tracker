'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useUser } from '@/stack/hooks'
import { Button } from '@/components/ui/button'

function NavLinksInner() {
  const user = useUser()

  if (!user) {
    return (
      <Link href="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
    )
  }

  return (
    <>
      <Link href="/workspaces">
        <Button variant="ghost">My Workspaces</Button>
      </Link>
      <Link href="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
    </>
  )
}

export function NavLinks() {
  return (
    <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-md bg-muted" />}>
      <NavLinksInner />
    </Suspense>
  )
}
