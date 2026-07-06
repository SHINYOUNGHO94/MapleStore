import { useCallback, useEffect, useState } from 'react'
import { addCashEntry, deleteCashEntry, loadCashEntries } from '../lib/financeStore'
import type { CashEntry, CashEntryDraft } from '../types'

function sortEntries(entries: CashEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

export function useCashLedger() {
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await loadCashEntries())
    } catch (e) {
      setError(e instanceof Error ? e.message : '현금 기록 불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(async (draft: CashEntryDraft) => {
    const created = await addCashEntry(draft)
    setEntries(prev => sortEntries([created, ...prev]))
    return created
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteCashEntry(id)
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }, [])

  return { entries, loading, error, refresh, add, remove }
}
