import { supabase } from './supabase'
import { DEFAULT_GIRLFRIEND_ACCOUNT_ID, DEFAULT_MINE_ACCOUNT_ID } from './accountStore'
import type { LedgerEntry, LedgerEntryDraft } from '../types'

const tableName = 'ledger_entries'
const localKey = 'maplestore-ledger-entries'

export async function loadLedgerEntries() {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return sortEntries((data ?? []).map(normalizeEntry))
  }

  return loadLocalEntries()
}

export async function addLedgerEntry(draft: LedgerEntryDraft) {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(draft)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return normalizeEntry(data)
  }

  const entry: LedgerEntry = {
    ...draft,
    id: createId(),
    created_at: new Date().toISOString(),
  }
  const entries = sortEntries([entry, ...loadLocalEntries()])
  saveLocalEntries(entries)
  return entry
}

export async function addLedgerEntries(drafts: LedgerEntryDraft[]) {
  if (drafts.length === 0) return []

  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(drafts)
      .select()

    if (error) throw new Error(error.message)
    return sortEntries((data ?? []).map(normalizeEntry))
  }

  const now = new Date().toISOString()
  const created = drafts.map((draft, index): LedgerEntry => ({
    ...draft,
    id: createId(),
    created_at: new Date(Date.parse(now) + index).toISOString(),
  }))
  const entries = sortEntries([...created, ...loadLocalEntries()])
  saveLocalEntries(entries)
  return created
}

export async function updateLedgerEntry(id: string, draft: LedgerEntryDraft): Promise<LedgerEntry> {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .update(draft)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return normalizeEntry(data)
  }

  const entries = loadLocalEntries()
  const idx = entries.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error('기록을 찾을 수 없습니다.')
  const updated: LedgerEntry = { ...entries[idx], ...draft }
  const next = sortEntries(entries.map((e, i) => (i === idx ? updated : e)))
  saveLocalEntries(next)
  return updated
}

export async function deleteLedgerEntry(id: string) {
  if (supabase) {
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  saveLocalEntries(loadLocalEntries().filter((entry) => entry.id !== id))
}

export async function importLedgerEntries(entries: LedgerEntry[]) {
  const normalized = entries.map(normalizeEntry)

  if (supabase) {
    const { error } = await supabase
      .from(tableName)
      .upsert(normalized, { onConflict: 'id' })
      .select()

    if (error) throw new Error(error.message)
    return loadLedgerEntries()
  }

  const merged = new Map<string, LedgerEntry>()
  for (const entry of loadLocalEntries()) merged.set(entry.id, entry)
  for (const entry of normalized) merged.set(entry.id, entry)
  const nextEntries = sortEntries([...merged.values()])
  saveLocalEntries(nextEntries)
  return nextEntries
}

function loadLocalEntries() {
  const saved = window.localStorage.getItem(localKey)
  if (!saved) return []

  try {
    const parsed = JSON.parse(saved) as LedgerEntry[]
    return sortEntries(parsed.map(normalizeEntry))
  } catch {
    return []
  }
}

function saveLocalEntries(entries: LedgerEntry[]) {
  window.localStorage.setItem(localKey, JSON.stringify(entries))
}

function normalizeEntry(entry: Partial<LedgerEntry> & { location?: string }): LedgerEntry {
  return {
    id: String(entry.id ?? createId()),
    occurred_on: String(entry.occurred_on ?? new Date().toISOString().slice(0, 10)),
    entry_type: entry.entry_type ?? 'boss_income',
    account_id: entry.account_id ?? legacyLocationToAccountId(entry.location),
    amount_meso: Number(entry.amount_meso ?? 0),
    boss_name: entry.boss_name?.trim() || null,
    memo: entry.memo?.trim() || null,
    created_at: String(entry.created_at ?? new Date().toISOString()),
  }
}

function sortEntries(entries: LedgerEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) {
      return b.occurred_on.localeCompare(a.occurred_on)
    }
    return b.created_at.localeCompare(a.created_at)
  })
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function legacyLocationToAccountId(location: string | undefined) {
  return location === 'my_account' ? DEFAULT_MINE_ACCOUNT_ID : DEFAULT_GIRLFRIEND_ACCOUNT_ID
}
