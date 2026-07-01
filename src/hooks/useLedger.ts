import { useCallback, useEffect, useState } from 'react'
import {
  addLedgerEntries,
  addLedgerEntry,
  deleteLedgerEntry,
  importLedgerEntries,
  loadLedgerEntries,
  updateLedgerEntry,
} from '../lib/ledgerStore'
import type { LedgerEntry, LedgerEntryDraft } from '../types'

function sortEntries(entries: LedgerEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

export function useLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await loadLedgerEntries())
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(async (draft: LedgerEntryDraft) => {
    const created = await addLedgerEntry(draft)
    setEntries(prev => sortEntries([created, ...prev]))
    return created
  }, [])

  const addMany = useCallback(async (drafts: LedgerEntryDraft[]) => {
    const created = await addLedgerEntries(drafts)
    setEntries(prev => sortEntries([...created, ...prev]))
    return created
  }, [])

  const update = useCallback(async (id: string, draft: LedgerEntryDraft) => {
    const updated = await updateLedgerEntry(id, draft)
    setEntries(prev => sortEntries(prev.map(e => (e.id === id ? updated : e))))
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteLedgerEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const importEntries = useCallback(async (imported: LedgerEntry[]) => {
    const next = await importLedgerEntries(imported)
    setEntries(next)
  }, [])

  return { entries, loading, error, refresh, add, addMany, update, remove, importEntries }
}
