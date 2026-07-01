import { supabase } from './supabase'
import type { Account, AccountDraft } from '../types'

const tableName = 'accounts'
const localKey = 'maplestore-accounts'

export const DEFAULT_MINE_ACCOUNT_ID = 'local-mine'
export const DEFAULT_GIRLFRIEND_ACCOUNT_ID = 'local-acc-1'

export async function loadAccounts(): Promise<Account[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return sortAccounts((data ?? []).map(normalizeAccount))
  }

  return loadLocalAccounts()
}

export async function addAccount(draft: AccountDraft): Promise<Account> {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(draft)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return normalizeAccount(data)
  }

  const account: Account = {
    ...draft,
    id: createId(),
    balance_meso: 0,
    balance_updated_at: null,
    created_at: new Date().toISOString(),
  }
  const accounts = sortAccounts([...loadLocalAccounts(), account])
  saveLocalAccounts(accounts)
  return account
}

export async function renameAccount(id: string, name: string): Promise<Account> {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .update({ name })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return normalizeAccount(data)
  }

  const accounts = loadLocalAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('통장을 찾을 수 없습니다.')
  const updated: Account = { ...accounts[idx], name }
  const next = sortAccounts(accounts.map((a, i) => (i === idx ? updated : a)))
  saveLocalAccounts(next)
  return updated
}

export async function deleteAccount(id: string) {
  if (supabase) {
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  saveLocalAccounts(loadLocalAccounts().filter((a) => a.id !== id))
}

function loadLocalAccounts(): Account[] {
  const saved = window.localStorage.getItem(localKey)
  if (!saved) {
    const seeded = seedLocalAccounts()
    saveLocalAccounts(seeded)
    return seeded
  }

  try {
    const parsed = JSON.parse(saved) as Account[]
    if (parsed.length === 0) return seedLocalAccounts()
    return sortAccounts(parsed.map(normalizeAccount))
  } catch {
    return seedLocalAccounts()
  }
}

function seedLocalAccounts(): Account[] {
  const now = new Date().toISOString()
  const seeded: Account[] = [
    { id: DEFAULT_MINE_ACCOUNT_ID, name: '내 계정', is_mine: true, balance_meso: 0, balance_updated_at: null, created_at: now },
    { id: DEFAULT_GIRLFRIEND_ACCOUNT_ID, name: '아야짱 통장', is_mine: false, balance_meso: 0, balance_updated_at: null, created_at: now },
  ]
  saveLocalAccounts(seeded)
  return seeded
}

function saveLocalAccounts(accounts: Account[]) {
  window.localStorage.setItem(localKey, JSON.stringify(accounts))
}

function normalizeAccount(account: Partial<Account>): Account {
  const name = normalizeAccountName(account.name)
  return {
    id: String(account.id ?? createId()),
    name,
    is_mine: name.includes('아야') ? false : Boolean(account.is_mine),
    balance_meso: Number(account.balance_meso ?? 0),
    balance_updated_at: account.balance_updated_at ?? null,
    created_at: String(account.created_at ?? new Date().toISOString()),
  }
}

function normalizeAccountName(name: string | undefined) {
  if (!name) return '통장'
  if (name === '통장1' || name === '여친 통장' || name === '아야짱' || name === '아야짱 계정') return '아야짱 통장'
  if (name === '내계정') return '내 계정'
  return name
}

function sortAccounts(accounts: Account[]) {
  return [...accounts].sort((a, b) => {
    if (a.is_mine !== b.is_mine) return a.is_mine ? 1 : -1
    return a.created_at.localeCompare(b.created_at)
  })
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}
