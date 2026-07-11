import { useCallback, useEffect, useState } from 'react'
import {
  addServerTransfer,
  deleteServerTransfer,
  loadServerTransfers,
} from '../lib/serverTransferStore'
import type { ServerTransfer, ServerTransferDraft } from '../types'

function sortTransfers(entries: ServerTransfer[]) {
  return [...entries].sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
    return b.created_at.localeCompare(a.created_at)
  })
}

export function useServerTransfers() {
  const [entries, setEntries] = useState<ServerTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await loadServerTransfers())
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(async (draft: ServerTransferDraft) => {
    const created = await addServerTransfer(draft)
    setEntries(prev => sortTransfers([created, ...prev]))
    return created
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteServerTransfer(id)
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }, [])

  return { entries, loading, error, refresh, add, remove }
}
