import { useMemo, useRef, useState } from 'react'
import { BookOpen, CircleDollarSign, Database, Home, Plus, Settings, Swords } from 'lucide-react'
import './App.css'
import { useLedger } from './hooks/useLedger'
import { useAccounts } from './hooks/useAccounts'
import { useCashLedger } from './hooks/useCashLedger'
import { useLostArkLedger } from './hooks/useLostArkLedger'
import { buildSummary, DEFAULT_RESET_DAY, getWeekStartDate, todayInputValue } from './lib/calculations'
import { buildCashSummary, buildLostArkSummary } from './lib/financeCalculations'
import { isSupabaseConfigured } from './lib/supabase'
import { getT, type Lang } from './lib/i18n'
import type { CashEntryDraft, LedgerEntry, LedgerEntryDraft, LostArkEntryDraft } from './types'
import Dashboard from './components/Dashboard'
import EntryForm from './components/EntryForm'
import LedgerList from './components/LedgerList'
import SettingsPanel from './components/SettingsPanel'
import EditModal from './components/EditModal'
import CashBankPanel from './components/CashBankPanel'
import LostArkPanel from './components/LostArkPanel'

type Tab = 'dashboard' | 'add' | 'cash' | 'lostark' | 'ledger' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [lang, setLang] = useState<Lang>(() => {
    const saved = window.localStorage.getItem('maplestore-lang')
    return (saved === 'ko' || saved === 'ja') ? saved : 'ko'
  })
  const [resetDay, setResetDay] = useState(() => {
    const saved = window.localStorage.getItem('maplestore-reset-day')
    return saved ? Number(saved) : DEFAULT_RESET_DAY
  })
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const importRef = useRef<HTMLInputElement | null>(null)

  const t = getT(lang)
  const { entries, loading, error, refresh, add, addMany, update, remove, importEntries } = useLedger()
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    add: addAccount,
    rename: renameAccount,
    remove: removeAccount,
  } = useAccounts()
  const {
    entries: cashEntries,
    loading: cashLoading,
    error: cashError,
    add: addCash,
    remove: removeCash,
  } = useCashLedger()
  const {
    entries: lostArkEntries,
    loading: lostArkLoading,
    error: lostArkError,
    add: addLostArk,
    remove: removeLostArk,
  } = useLostArkLedger()

  const summary = useMemo(() => buildSummary(entries, accounts, resetDay), [entries, accounts, resetDay])
  const cashSummary = useMemo(() => buildCashSummary(cashEntries), [cashEntries])
  const lostArkSummary = useMemo(() => buildLostArkSummary(lostArkEntries), [lostArkEntries])
  const weekStart = getWeekStartDate(todayInputValue(), resetDay)
  const recentEntries = useMemo(() => entries.slice(0, 6), [entries])
  const tabs = [
    { id: 'dashboard' as const, icon: <Home size={20} />, label: t.tabs.home },
    { id: 'add' as const, icon: <Plus size={20} />, label: t.tabs.add },
    { id: 'cash' as const, icon: <CircleDollarSign size={20} />, label: t.tabs.cash },
    { id: 'lostark' as const, icon: <Swords size={20} />, label: t.tabs.lostark },
    { id: 'ledger' as const, icon: <BookOpen size={20} />, label: t.tabs.ledger },
    { id: 'settings' as const, icon: <Settings size={20} />, label: t.tabs.settings },
  ]
  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label ?? t.tabs.home
  const activeError = error || cashError || lostArkError

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleLangChange(next: Lang) {
    setLang(next)
    window.localStorage.setItem('maplestore-lang', next)
  }

  function handleResetDayChange(day: number) {
    setResetDay(day)
    window.localStorage.setItem('maplestore-reset-day', String(day))
  }

  async function handleAdd(draft: LedgerEntryDraft) {
    setSaving(true)
    try {
      await add(draft)
      showToast(t.toast.saved)
      setActiveTab('dashboard')
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddMany(drafts: LedgerEntryDraft[]) {
    setSaving(true)
    try {
      await addMany(drafts)
      showToast(t.toast.saved)
      setActiveTab('dashboard')
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddCash(draft: CashEntryDraft) {
    setSaving(true)
    try {
      await addCash(draft)
      showToast(t.toast.saved)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCash(id: string) {
    try {
      await removeCash(id)
      showToast(t.toast.deleted)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.deleteError)
    }
  }

  async function handleAddLostArk(draft: LostArkEntryDraft) {
    setSaving(true)
    try {
      await addLostArk(draft)
      showToast(t.toast.saved)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLostArk(id: string) {
    try {
      await removeLostArk(id)
      showToast(t.toast.deleted)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.deleteError)
    }
  }

  async function handleUpdate(id: string, draft: LedgerEntryDraft) {
    setSaving(true)
    try {
      await update(id, draft)
      setEditingEntry(null)
      showToast(t.toast.updated)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.updateError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id)
      showToast(t.toast.deleted)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.deleteError)
    }
  }

  async function handleAddAccount(name: string, isMine: boolean) {
    try {
      await addAccount({ name, is_mine: isMine })
      showToast(t.toast.saved)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.saveError)
    }
  }

  async function handleRenameAccount(id: string, name: string) {
    try {
      await renameAccount(id, name)
      showToast(t.toast.updated)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.updateError)
    }
  }

  async function handleDeleteAccount(id: string) {
    if (accounts.length <= 1) {
      showToast(t.settings.accountLastError)
      return
    }
    if (entries.some(e => e.account_id === id)) {
      showToast(t.settings.accountInUse)
      return
    }
    try {
      await removeAccount(id)
      showToast(t.toast.deleted)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.deleteError)
    }
  }

  function handleExport() {
    const payload = JSON.stringify({ version: 1, entries }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `maplestore-${todayInputValue()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File | undefined) {
    if (!file) return
    try {
      const text = await file.text()
      const payload = JSON.parse(text) as { entries?: LedgerEntry[] } | LedgerEntry[]
      const imported = Array.isArray(payload) ? payload : payload.entries
      if (!Array.isArray(imported)) throw new Error(t.toast.noImportData)
      await importEntries(imported)
      showToast(t.toast.imported)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.toast.importError)
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <img src="/assets/devil-aya/app-icon-devil-aya.png" alt="" />
          </div>
          <div>
            <p className="eyebrow">{t.header.eyebrow}</p>
            <strong>{t.header.title}</strong>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="desktop nav">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="lang-toggle">
            <button
              className={lang === 'ko' ? 'active' : ''}
              type="button"
              onClick={() => handleLangChange('ko')}
            >
              KR
            </button>
            <button
              className={lang === 'ja' ? 'active' : ''}
              type="button"
              onClick={() => handleLangChange('ja')}
            >
              JP
            </button>
          </div>
          <div className={`sync-pill ${isSupabaseConfigured ? 'online' : ''}`}>
            <Database size={15} aria-hidden="true" />
            {isSupabaseConfigured ? t.misc.supabase : t.misc.local}
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div>
            <p className="eyebrow">{t.header.eyebrow}</p>
            <h1>{activeTabLabel}</h1>
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <button
                className={lang === 'ko' ? 'active' : ''}
                type="button"
                onClick={() => handleLangChange('ko')}
              >
                KR
              </button>
              <button
                className={lang === 'ja' ? 'active' : ''}
                type="button"
                onClick={() => handleLangChange('ja')}
              >
                JP
              </button>
            </div>
            <div className={`sync-pill ${isSupabaseConfigured ? 'online' : ''}`}>
              <Database size={15} aria-hidden="true" />
              {isSupabaseConfigured ? t.misc.supabase : t.misc.local}
            </div>
          </div>
        </header>

        {(toast || activeError) && (
          <div className={`status-line ${activeError ? 'error' : ''}`}>{activeError || toast}</div>
        )}

        <section className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard
              t={t}
              summary={summary}
              cashSummary={cashSummary}
              lostArkSummary={lostArkSummary}
              accounts={accounts}
              weekStart={weekStart}
              recentEntries={recentEntries}
              loading={loading}
              onAdd={() => setActiveTab('add')}
              onEdit={setEditingEntry}
              onDelete={id => void handleDelete(id)}
            />
          )}
          {activeTab === 'add' && (
            <EntryForm
              t={t}
              accounts={accounts}
              saving={saving}
              summary={summary}
              onSave={draft => handleAdd(draft)}
              onSaveMany={drafts => handleAddMany(drafts)}
            />
          )}
          {activeTab === 'cash' && (
            <CashBankPanel
              t={t}
              entries={cashEntries}
              loading={cashLoading}
              saving={saving}
              onSave={draft => handleAddCash(draft)}
              onDelete={id => void handleDeleteCash(id)}
            />
          )}
          {activeTab === 'lostark' && (
            <LostArkPanel
              t={t}
              entries={lostArkEntries}
              loading={lostArkLoading}
              saving={saving}
              onSave={draft => handleAddLostArk(draft)}
              onDelete={id => void handleDeleteLostArk(id)}
            />
          )}
          {activeTab === 'ledger' && (
            <LedgerList
              t={t}
              entries={entries}
              cashEntries={cashEntries}
              lostArkEntries={lostArkEntries}
              accounts={accounts}
              loading={loading}
              cashLoading={cashLoading}
              lostArkLoading={lostArkLoading}
              resetDay={resetDay}
              onEdit={setEditingEntry}
              onDelete={id => void handleDelete(id)}
              onDeleteCash={id => void handleDeleteCash(id)}
              onDeleteLostArk={id => void handleDeleteLostArk(id)}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPanel
              t={t}
              resetDay={resetDay}
              onResetDayChange={handleResetDayChange}
              onExport={handleExport}
              onImport={() => importRef.current?.click()}
              onRefresh={() => void refresh()}
              accounts={accounts}
              accountsLoading={accountsLoading}
              accountsError={accountsError}
              onAddAccount={(name, isMine) => void handleAddAccount(name, isMine)}
              onRenameAccount={(id, name) => void handleRenameAccount(id, name)}
              onDeleteAccount={id => void handleDeleteAccount(id)}
            />
          )}
        </section>
      </div>

      {editingEntry && (
        <EditModal
          t={t}
          entry={editingEntry}
          accounts={accounts}
          saving={saving}
          onSave={draft => handleUpdate(editingEntry.id, draft)}
          onClose={() => setEditingEntry(null)}
        />
      )}

      <input
        ref={importRef}
        className="file-input"
        type="file"
        accept="application/json"
        onChange={e => void handleImport(e.target.files?.[0])}
      />

      <nav className="tab-bar" aria-label="nav">
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            icon={tab.icon}
            label={tab.label}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </nav>
    </main>
  )
}

function TabButton({
  active, icon, label, onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button className={active ? 'active' : ''} type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
