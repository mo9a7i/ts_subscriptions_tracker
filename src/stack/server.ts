import 'server-only'

import { HexclaveServerApp } from '@hexclave/next'
import { hexclaveClientApp } from './client'

let hexclaveServerAppInstance: HexclaveServerApp | null = null

export function getHexclaveServerApp(): HexclaveServerApp {
  if (!hexclaveServerAppInstance) {
    hexclaveServerAppInstance = new HexclaveServerApp({
      inheritsFrom: hexclaveClientApp,
    })
  }

  return hexclaveServerAppInstance
}
