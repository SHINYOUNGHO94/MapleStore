import type { Account, LedgerEntry, MapleServer, MapleServerFilter, ServerTransfer } from '../types'
import { floorToMan } from './units'
import { MAPLE_SERVERS, normalizeMapleServer } from './mapleServers'

export const DEFAULT_RESET_DAY = 4

export function todayInputValue() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function getWeekStartDate(dateValue: string, resetDay = DEFAULT_RESET_DAY) {
  const date = parseDateOnly(dateValue)
  const diff = (date.getDay() - resetDay + 7) % 7
  date.setDate(date.getDate() - diff)
  return toDateOnly(date)
}

export type Summary = {
  bossIncome: number
  bossCostFromMyMeso: number
  bossCostFromGirlfriendMeso: number
  girlfriendContribution: number
  repaidToGirlfriend: number
  withdrawnMyShare: number
  manualAdjustment: number
  totalBossCost: number
  netBossProfit: number
  debtToGirlfriend: number
  myClaimOnGirlfriendAccount: number
  myClaimByAccount: Record<string, number>
  myClaimByServer: Record<MapleServer, number>
  debtByServer: Record<MapleServer, number>
  bossIncomeByServer: Record<MapleServer, number>
  bossCostByServer: Record<MapleServer, number>
  transferFeeByServer: Record<MapleServer, number>
  serverFilter: MapleServerFilter
  thisWeekBossIncome: number
  thisWeekBossCost: number
  thisWeekNet: number
}

export type SettlementInfo = {
  claim: number
  debt: number
  netWorth: number
  repayable: number
  withdrawable: number
  remainingDebt: number
}

export function getSettlementInfo(summary: Summary, accountId?: string, server?: MapleServerFilter): SettlementInfo {
  if (server && server !== 'all') {
    const claim = Math.max(0, floorToMan(summary.myClaimByServer[server] ?? 0))
    const debt = Math.max(0, floorToMan(summary.debtByServer[server] ?? 0))
    return {
      claim,
      debt,
      netWorth: floorToMan(claim - debt),
      repayable: Math.min(claim, debt),
      withdrawable: Math.max(0, claim - debt),
      remainingDebt: Math.max(0, debt - claim),
    }
  }

  const rawClaim = accountId
    ? summary.myClaimByAccount[accountId] ?? 0
    : summary.myClaimOnGirlfriendAccount
  const claim = Math.max(0, floorToMan(rawClaim))
  const debt = Math.max(0, floorToMan(summary.debtToGirlfriend))
  const repayable = Math.min(claim, debt)
  const withdrawable = Math.max(0, claim - debt)
  const remainingDebt = Math.max(0, debt - claim)

  return {
    claim,
    debt,
    netWorth: floorToMan(summary.myClaimOnGirlfriendAccount - summary.debtToGirlfriend),
    repayable,
    withdrawable,
    remainingDebt,
  }
}

export function buildSummary(
  entries: LedgerEntry[],
  accounts: Account[],
  resetDay = DEFAULT_RESET_DAY,
  transfers: ServerTransfer[] = [],
  serverFilter: MapleServerFilter = 'all',
): Summary {
  const thisWeekStart = getWeekStartDate(todayInputValue(), resetDay)
  const mineAccountIds = new Set(accounts.filter(a => a.is_mine).map(a => a.id))
  const isGirlfriendAccount = (accountId: string) => !mineAccountIds.has(accountId)
  const byServer = () => ({ scania: 0, challengers: 0 })

  const s: Summary = {
    bossIncome: 0,
    bossCostFromMyMeso: 0,
    bossCostFromGirlfriendMeso: 0,
    girlfriendContribution: 0,
    repaidToGirlfriend: 0,
    withdrawnMyShare: 0,
    manualAdjustment: 0,
    totalBossCost: 0,
    netBossProfit: 0,
    debtToGirlfriend: 0,
    myClaimOnGirlfriendAccount: 0,
    myClaimByAccount: {},
    myClaimByServer: byServer(),
    debtByServer: byServer(),
    bossIncomeByServer: byServer(),
    bossCostByServer: byServer(),
    transferFeeByServer: byServer(),
    serverFilter,
    thisWeekBossIncome: 0,
    thisWeekBossCost: 0,
    thisWeekNet: 0,
  }

  const includeServer = (server: MapleServer) => serverFilter === 'all' || serverFilter === server

  const addClaim = (accountId: string, delta: number, server: MapleServer) => {
    s.myClaimByAccount[accountId] = (s.myClaimByAccount[accountId] ?? 0) + delta
    s.myClaimOnGirlfriendAccount += delta
    s.myClaimByServer[server] += delta
  }

  for (const entry of entries) {
    const server = normalizeMapleServer(entry.server)
    if (!includeServer(server)) continue
    const amount = floorToMan(Number(entry.amount_meso))
    const isThisWeek = entry.occurred_on >= thisWeekStart

    switch (entry.entry_type) {
      case 'boss_income':
        s.bossIncome += amount
        s.bossIncomeByServer[server] += amount
        if (isThisWeek) s.thisWeekBossIncome += amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, amount, server)
        break

      case 'boss_cost_my':
        s.bossCostFromMyMeso += amount
        s.bossCostByServer[server] += amount
        if (isThisWeek) s.thisWeekBossCost += amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, -amount, server)
        break

      case 'boss_cost_girlfriend':
        s.bossCostFromGirlfriendMeso += amount
        s.bossCostByServer[server] += amount
        s.debtToGirlfriend += amount
        s.debtByServer[server] += amount
        if (isThisWeek) s.thisWeekBossCost += amount
        break

      case 'girlfriend_contribution':
        s.girlfriendContribution += amount
        break

      case 'repay_girlfriend':
        s.repaidToGirlfriend += amount
        s.debtToGirlfriend -= amount
        s.debtByServer[server] -= amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, -amount, server)
        break

      case 'withdraw_my_share':
        s.withdrawnMyShare += amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, -amount, server)
        break

      case 'adjustment':
        s.manualAdjustment += amount
        break
    }
  }

  for (const transfer of transfers) {
    const from = normalizeMapleServer(transfer.from_server)
    const to = normalizeMapleServer(transfer.to_server)
    const amount = floorToMan(Number(transfer.oppa_amount_meso ?? transfer.amount_meso))
    const fee = floorToMan(Number(transfer.oppa_fee_meso ?? amount * 0.01))
    const received = floorToMan(Number(transfer.oppa_received_meso ?? Math.max(0, amount - fee)))

    if (serverFilter === 'all') {
      s.myClaimOnGirlfriendAccount -= amount
      s.myClaimOnGirlfriendAccount += received
      s.myClaimByServer[from] -= amount
      s.myClaimByServer[to] += received
      s.transferFeeByServer[from] += fee
    } else if (serverFilter === from) {
      s.myClaimOnGirlfriendAccount -= amount
      s.myClaimByServer[from] -= amount
      s.transferFeeByServer[from] += fee
    } else if (serverFilter === to) {
      s.myClaimOnGirlfriendAccount += received
      s.myClaimByServer[to] += received
    }
  }

  for (const server of MAPLE_SERVERS) {
    s.debtByServer[server] = Math.max(0, floorToMan(s.debtByServer[server]))
  }

  s.totalBossCost = s.bossCostFromMyMeso + s.bossCostFromGirlfriendMeso
  s.netBossProfit = s.bossIncome - s.totalBossCost + s.manualAdjustment
  s.thisWeekNet = s.thisWeekBossIncome - s.thisWeekBossCost

  return s
}

export type WeekGroup = {
  weekStart: string
  entries: LedgerEntry[]
  bossIncome: number
  bossCost: number
  net: number
}

export type LedgerPeriod = 'all' | 'week' | 'month' | 'year'

export type LedgerPeriodGroup = {
  key: string
  label: string
  entries: LedgerEntry[]
  bossIncome: number
  bossCost: number
  net: number
}

export function groupByWeek(entries: LedgerEntry[], resetDay = DEFAULT_RESET_DAY): WeekGroup[] {
  const map = new Map<string, LedgerEntry[]>()
  for (const entry of entries) {
    const ws = getWeekStartDate(entry.occurred_on, resetDay)
    const bucket = map.get(ws)
    if (bucket) bucket.push(entry)
    else map.set(ws, [entry])
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, weekEntries]) => {
      let bossIncome = 0
      let bossCost = 0
      for (const e of weekEntries) {
        const amt = floorToMan(Number(e.amount_meso))
        if (e.entry_type === 'boss_income') bossIncome += amt
        if (e.entry_type === 'boss_cost_my' || e.entry_type === 'boss_cost_girlfriend') bossCost += amt
      }
      return { weekStart, entries: weekEntries, bossIncome, bossCost, net: bossIncome - bossCost }
    })
}

export function groupLedgerByPeriod(
  entries: LedgerEntry[],
  period: LedgerPeriod,
  resetDay = DEFAULT_RESET_DAY,
): LedgerPeriodGroup[] {
  const map = new Map<string, { key: string; label: string; entries: LedgerEntry[] }>()

  for (const entry of entries) {
    const key = getLedgerPeriodKey(entry.occurred_on, period, resetDay)
    const label = getLedgerPeriodLabel(entry.occurred_on, period, resetDay)
    const group = map.get(key) ?? { key, label, entries: [] }
    group.entries.push(entry)
    map.set(key, group)
  }

  return [...map.values()]
    .map(group => {
      let bossIncome = 0
      let bossCost = 0
      const sortedEntries = [...group.entries].sort((a, b) => {
        if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
        return b.created_at.localeCompare(a.created_at)
      })

      for (const entry of sortedEntries) {
        const amount = floorToMan(Number(entry.amount_meso))
        if (entry.entry_type === 'boss_income') bossIncome += amount
        if (entry.entry_type === 'boss_cost_my' || entry.entry_type === 'boss_cost_girlfriend') bossCost += amount
      }

      return {
        key: group.key,
        label: group.label,
        entries: sortedEntries,
        bossIncome,
        bossCost,
        net: bossIncome - bossCost,
      }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

function getLedgerPeriodKey(dateValue: string, period: LedgerPeriod, resetDay: number) {
  if (period === 'all') return 'all'
  if (period === 'week') return getWeekStartDate(dateValue, resetDay)
  if (period === 'month') return dateValue.slice(0, 7)
  return dateValue.slice(0, 4)
}

function getLedgerPeriodLabel(dateValue: string, period: LedgerPeriod, resetDay: number) {
  if (period === 'all') return 'All'
  if (period === 'week') return getWeekStartDate(dateValue, resetDay)
  if (period === 'month') return dateValue.slice(0, 7)
  return dateValue.slice(0, 4)
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateOnly(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
