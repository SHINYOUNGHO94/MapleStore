import { useCallback, useEffect, useState } from 'react'
import { addLostArkEntry, deleteLostArkEntry, loadLostArkEntries } from '../lib/financeStore'
import type { LostArkEntry, LostArkEntryDraft } from '../types'

function sortEntries(entries: LostArkEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

export function useLostArkLedger() {
  const [entries, setEntries] = useState<LostArkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await loadLostArkEntries())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'LostArk 기록 불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(async (draft: LostArkEntryDraft) => {
    const created = await addLostArkEntry(draft)
    setEntries(prev => sortEntries([created, ...prev]))
    return created
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteLostArkEntry(id)
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }, [])

  return { entries, loading, error, refresh, add, remove }
}
