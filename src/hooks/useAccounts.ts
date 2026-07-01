import { useCallback, useEffect, useState } from 'react'
import { addAccount, deleteAccount, loadAccounts, renameAccount } from '../lib/accountStore'
import type { Account, AccountDraft } from '../types'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAccounts(await loadAccounts())
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(async (draft: AccountDraft) => {
    const created = await addAccount(draft)
    setAccounts(prev => [...prev, created])
    return created
  }, [])

  const rename = useCallback(async (id: string, name: string) => {
    const updated = await renameAccount(id, name)
    setAccounts(prev => prev.map(a => (a.id === id ? updated : a)))
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteAccount(id)
    setAccounts(prev => prev.filter(a => a.id !== id))
  }, [])

  return { accounts, loading, error, refresh, add, rename, remove }
}
