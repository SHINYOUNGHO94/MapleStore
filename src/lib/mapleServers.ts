import type { MapleServer, MapleServerFilter } from '../types'
import type { T } from './i18n'

export const DEFAULT_MAPLE_SERVER: MapleServer = 'challengers'

export const MAPLE_SERVERS: MapleServer[] = ['scania', 'challengers']

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
