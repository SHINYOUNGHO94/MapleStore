import { supabase } from './supabase'
import type {
  CashEntry,
  CashEntryDraft,
  CashGame,
  CashCurrency,
  EntryDirection,
  LostArkEntry,
  LostArkEntryDraft,
} from '../types'

const cashTable = 'cash_entries'
const lostArkTable = 'lostark_entries'
const cashLocalKey = 'maplestore-cash-entries'
const lostArkLocalKey = 'maplestore-lostark-entries'

export async function loadCashEntries(): Promise<CashEntry[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from(cashTable)
      .select('*')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return sortCashEntries((data ?? []).map(normalizeCashEntry))
  }

  return loadLocalCashEntries()
}

export async function addCashEntry(draft: CashEntryDraft): Promise<CashEntry> {
  if (supabase) {
    const { data, error } = await supabase
      .from(cashTable)
      .insert(draft)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return normalizeCashEntry(data)
  }

  const entry: CashEntry = {
    ...draft,
    id: createId(),
    created_at: new Date().toISOString(),
  }
  saveLocalCashEntries(sortCashEntries([entry, ...loadLocalCashEntries()]))
  return entry
}

export async function deleteCashEntry(id: string) {
  if (supabase) {
    const { error } = await supabase.from(cashTable).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  saveLocalCashEntries(loadLocalCashEntries().filter(entry => entry.id !== id))
}

export async function loadLostArkEntries(): Promise<LostArkEntry[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from(lostArkTable)
      .select('*')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return sortLostArkEntries((data ?? []).map(normalizeLostArkEntry))
  }

  return loadLocalLostArkEntries()
}

export async function addLostArkEntry(draft: LostArkEntryDraft): Promise<LostArkEntry> {
  if (supabase) {
    const { data, error } = await supabase
      .from(lostArkTable)
      .insert(draft)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return normalizeLostArkEntry(data)
  }

  const entry: LostArkEntry = {
    ...draft,
    id: createId(),
    created_at: new Date().toISOString(),
  }
  saveLocalLostArkEntries(sortLostArkEntries([entry, ...loadLocalLostArkEntries()]))
  return entry
}

export async function deleteLostArkEntry(id: string) {
  if (supabase) {
    const { error } = await supabase.from(lostArkTable).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  saveLocalLostArkEntries(loadLocalLostArkEntries().filter(entry => entry.id !== id))
}

function loadLocalCashEntries(): CashEntry[] {
  const saved = window.localStorage.getItem(cashLocalKey)
  if (!saved) return []

  try {
    return sortCashEntries((JSON.parse(saved) as CashEntry[]).map(normalizeCashEntry))
  } catch {
    return []
  }
}

function saveLocalCashEntries(entries: CashEntry[]) {
  window.localStorage.setItem(cashLocalKey, JSON.stringify(entries))
}

function loadLocalLostArkEntries(): LostArkEntry[] {
  const saved = window.localStorage.getItem(lostArkLocalKey)
  if (!saved) return []

  try {
    return sortLostArkEntries((JSON.parse(saved) as LostArkEntry[]).map(normalizeLostArkEntry))
  } catch {
    return []
  }
}

function saveLocalLostArkEntries(entries: LostArkEntry[]) {
  window.localStorage.setItem(lostArkLocalKey, JSON.stringify(entries))
}

function normalizeCashEntry(entry: Partial<CashEntry>): CashEntry {
  return {
    id: String(entry.id ?? createId()),
    occurred_on: String(entry.occurred_on ?? new Date().toISOString().slice(0, 10)),
    game: normalizeCashGame(entry.game),
    direction: normalizeDirection(entry.direction),
    currency: normalizeCurrency(entry.currency),
    amount_cash: Math.max(0, Math.floor(Number(entry.amount_cash ?? 0))),
    memo: entry.memo?.trim() || null,
    created_at: String(entry.created_at ?? new Date().toISOString()),
  }
}

function normalizeLostArkEntry(entry: Partial<LostArkEntry>): LostArkEntry {
  const gross = Math.max(0, Math.floor(Number(entry.gross_gold ?? 0)))
  const net = Math.max(0, Math.floor(Number(entry.net_gold ?? gross)))
  return {
    id: String(entry.id ?? createId()),
    occurred_on: String(entry.occurred_on ?? new Date().toISOString().slice(0, 10)),
    direction: normalizeDirection(entry.direction),
    gross_gold: gross,
    net_gold: net,
    fee_applied: Boolean(entry.fee_applied),
    memo: entry.memo?.trim() || null,
    created_at: String(entry.created_at ?? new Date().toISOString()),
  }
}

function normalizeDirection(direction: EntryDirection | undefined): EntryDirection {
  return direction === 'withdraw' ? 'withdraw' : 'deposit'
}

function normalizeCashGame(game: CashGame | undefined): CashGame {
  return game === 'lostark' ? 'lostark' : 'maple'
}

function normalizeCurrency(currency: CashCurrency | undefined): CashCurrency {
  return currency === 'JPY' ? 'JPY' : 'KRW'
}

function sortCashEntries(entries: CashEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

function sortLostArkEntries(entries: LostArkEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}
