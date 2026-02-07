/**
 * Fetcher Registry
 *
 * Central registry of all minute fetchers and combined source list.
 * To add a new system, create a fetcher file implementing MinuteFetcher,
 * add its sources here, and register the fetcher.
 */

export type { MinuteFetcher, MinuteSource, Meeting } from './types.js'

import type { MinuteFetcher, MinuteSource } from './types.js'
import { cloudncFetcher, CLOUDNC_SOURCES } from './cloudnc.js'
import { dynastyFetcher, DYNASTY_SOURCES } from './dynasty.js'
import { twebFetcher, TWEB_SOURCES } from './tweb.js'

// Fetcher registry: type string → fetcher implementation
export const fetchers: Record<string, MinuteFetcher> = {
  cloudnc: cloudncFetcher,
  dynasty: dynastyFetcher,
  tweb: twebFetcher,
}

// All sources combined from all systems
export const MINUTE_SOURCES: MinuteSource[] = [
  ...CLOUDNC_SOURCES,
  ...DYNASTY_SOURCES,
  ...TWEB_SOURCES,
]
