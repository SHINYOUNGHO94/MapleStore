import type { MapleServer, MapleServerFilter } from '../types'
import type { T } from './i18n'

// See docs/challengers-world.md before enabling a new season.
export const CHALLENGERS_ENABLED = false
export const CHALLENGERS_MERGED_BEFORE = '2026-09-16T00:00:00+09:00'
export const DEFAULT_MAPLE_SERVER: MapleServer = 'scania'

export const MAPLE_SERVERS: MapleServer[] = CHALLENGERS_ENABLED ? ['scania', 'challengers'] : ['scania']

// Keep stored source worlds intact; old seasons always belong to Scania.
export function getEffectiveMapleServer(server: unknown, createdAt?: string): MapleServer {
  if (!CHALLENGERS_ENABLED) return 'scania'
  if (!createdAt || Date.parse(createdAt) < Date.parse(CHALLENGERS_MERGED_BEFORE)) return 'scania'
  return normalizeMapleServer(server)
}

export function normalizeMapleServer(server: unknown): MapleServer {
  return server === 'challengers' ? 'challengers' : 'scania'
}

export function isMapleServerFilter(value: MapleServerFilter): value is MapleServer {
  return value !== 'all'
}

export function getMapleServerLabel(t: T, server: MapleServerFilter) {
  if (server === 'all') return t.server.all
  return t.server[server]
}
