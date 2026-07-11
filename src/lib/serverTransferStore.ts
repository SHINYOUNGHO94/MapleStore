import { supabase } from './supabase'
import type { ServerTransfer, ServerTransferDraft } from '../types'
import { normalizeMapleServer } from './mapleServers'
import { floorToMan } from './units'

const tableName = 'server_transfers'
const localKey = 'maplestore-server-transfers'

export async function loadServerTransfers(): Promise<ServerTransfer[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return sortTransfers((data ?? []).map(normalizeTransfer))
  }

  return loadLocalTransfers()
}

export async function addServerTransfer(draft: ServerTransferDraft): Promise<ServerTransfer> {
  if (supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(draft)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return normalizeTransfer(data)
  }

  const entry: ServerTransfer = {
    ...draft,
    id: createId(),
    created_at: new Date().toISOString(),
  }
  saveLocalTransfers(sortTransfers([entry, ...loadLocalTransfers()]))
  return entry
}

export async function deleteServerTransfer(id: string) {
  if (supabase) {
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  saveLocalTransfers(loadLocalTransfers().filter(entry => entry.id !== id))
}

function loadLocalTransfers(): ServerTransfer[] {
  const saved = window.localStorage.getItem(localKey)
  if (!saved) return []

  try {
    return sortTransfers((JSON.parse(saved) as ServerTransfer[]).map(normalizeTransfer))
  } catch {
    return []
  }
}

function saveLocalTransfers(entries: ServerTransfer[]) {
  window.localStorage.setItem(localKey, JSON.stringify(entries))
}

function normalizeTransfer(entry: Partial<ServerTransfer>): ServerTransfer {
  const amount = floorToMan(Number(entry.amount_meso ?? 0))
  const fee = floorToMan(Number(entry.fee_meso ?? amount * 0.01))
  const received = floorToMan(Number(entry.received_meso ?? Math.max(0, amount - fee)))
  const oppaAmount = Math.min(amount, floorToMan(Number(entry.oppa_amount_meso ?? amount)))
  const oppaFee = Math.min(fee, floorToMan(Number(entry.oppa_fee_meso ?? oppaAmount * 0.01)))
  const oppaReceived = Math.min(received, floorToMan(Number(entry.oppa_received_meso ?? Math.max(0, oppaAmount - oppaFee))))
  return {
    id: String(entry.id ?? createId()),
    occurred_on: String(entry.occurred_on ?? new Date().toISOString().slice(0, 10)),
    from_server: normalizeMapleServer(entry.from_server),
    to_server: normalizeMapleServer(entry.to_server) === normalizeMapleServer(entry.from_server)
      ? (normalizeMapleServer(entry.from_server) === 'scania' ? 'challengers' : 'scania')
      : normalizeMapleServer(entry.to_server),
    amount_meso: amount,
    fee_meso: fee,
    received_meso: received,
    oppa_amount_meso: oppaAmount,
    oppa_fee_meso: oppaFee,
    oppa_received_meso: oppaReceived,
    memo: entry.memo?.trim() || null,
    created_at: String(entry.created_at ?? new Date().toISOString()),
  }
}

function sortTransfers(entries: ServerTransfer[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}
