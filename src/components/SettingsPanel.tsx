import { useState } from 'react'
import { Database, Download, LogOut, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import type { T } from '../lib/i18n'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Account } from '../types'

type Props = {
  t: T
  resetDay: number
  onResetDayChange: (day: number) => void
  onExport: () => void
  onImport: () => void
  onRefresh: () => void
  accounts: Account[]
  accountsLoading: boolean
  accountsError: string | null
  onAddAccount: (name: string, isMine: boolean) => void
  onRenameAccount: (id: string, name: string) => void
  onDeleteAccount: (id: string) => void
}

export default function SettingsPanel({
  t,
  resetDay,
  onResetDayChange,
  onExport,
  onImport,
  onRefresh,
  accounts,
  accountsLoading,
  accountsError,
  onAddAccount,
  onRenameAccount,
  onDeleteAccount,
}: Props) {
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountIsMine, setNewAccountIsMine] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function handleAdd() {
    const name = newAccountName.trim()
    if (!name) return
    onAddAccount(name, newAccountIsMine)
    setNewAccountName('')
    setNewAccountIsMine(false)
  }

  function startEdit(account: Account) {
    setEditingId(account.id)
    setEditingName(account.name)
  }

  function commitEdit() {
    const name = editingName.trim()
    if (editingId && name) onRenameAccount(editingId, name)
    setEditingId(null)
  }

  return (
    <div className="screen-stack">
      <div className="section-heading">
        <h2>{t.settings.title}</h2>
        <button className="icon-button" type="button" onClick={onRefresh} title={t.settings.refresh}>
          <Database size={19} aria-hidden="true" />
        </button>
      </div>

      <section className="settings-block">
        <h3>{t.settings.resetDay}</h3>
        <p className="settings-desc">{t.settings.resetDayDesc}</p>
        <div className="segmented-control day-control">
          {t.settings.days.map((day, i) => (
            <button
              key={i}
              className={resetDay === i ? 'selected' : ''}
              type="button"
              onClick={() => onResetDayChange(i)}
            >
              {day}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-block">
        <h3>{t.settings.accounts}</h3>
        <p className="settings-desc">{t.settings.accountsDesc}</p>

        {accountsError && <div className="form-error">{accountsError}</div>}

        {accountsLoading ? (
          <div className="empty-state">{t.dashboard.loading}</div>
        ) : (
          <div className="account-list">
            {accounts.map(account => (
              <div key={account.id} className="account-row">
                <span className={`account-badge ${account.is_mine ? 'mine' : ''}`}>
                  {account.is_mine ? t.settings.accountMineLabel : t.settings.accountGfLabel}
                </span>
                {editingId === account.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
                  />
                ) : (
                  <span className="account-row-name">{account.name}</span>
                )}
                <div className="account-row-actions">
                  <button className="icon-button" type="button" onClick={() => startEdit(account)} title={t.form.editTitle}>
                    <Pencil size={15} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDeleteAccount(account.id)} title={t.toast.deleted}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="account-add-row">
          <input
            placeholder={t.settings.accountAddPlaceholder}
            value={newAccountName}
            onChange={e => setNewAccountName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />
          <label className="account-mine-check">
            <input
              type="checkbox"
              checked={newAccountIsMine}
              onChange={e => setNewAccountIsMine(e.target.checked)}
            />
            {t.settings.accountMineCheckbox}
          </label>
          <button className="secondary-button" type="button" onClick={handleAdd}>
            <Plus size={18} aria-hidden="true" />
            {t.settings.accountAdd}
          </button>
        </div>
      </section>

      <section className="settings-block">
        <h3>{t.settings.backup}</h3>
        <div className="action-grid">
          <button className="secondary-button" type="button" onClick={onExport}>
            <Download size={18} aria-hidden="true" />
            {t.settings.export}
          </button>
          <button className="secondary-button" type="button" onClick={onImport}>
            <Upload size={18} aria-hidden="true" />
            {t.settings.import}
          </button>
        </div>
      </section>

      <section className="settings-block">
        <h3>{t.settings.connection}</h3>
        <div className={`connection-badge ${isSupabaseConfigured ? 'online' : ''}`}>
          <Database size={15} />
          {isSupabaseConfigured ? t.settings.supabaseConnected : t.settings.localMode}
        </div>
        {!isSupabaseConfigured && (
          <p className="settings-desc">{t.settings.supabaseDesc}</p>
        )}
      </section>

      <section className="settings-block">
        <h3>{t.settings.account}</h3>
        <a className="secondary-button" href="/api/logout">
          <LogOut size={18} aria-hidden="true" />
          {t.settings.logout}
        </a>
      </section>
    </div>
  )
}
