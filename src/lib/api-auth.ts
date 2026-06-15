import 'server-only'

import { NextResponse } from 'next/server'
import { getHexclaveServerApp } from '@/stack/server'

export async function getOptionalUser() {
  return getHexclaveServerApp().getUser()
}

export async function requireUser() {
  const user = await getOptionalUser()
  if (!user) {
    return {
      user: null as null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { user, error: null as null }
}
