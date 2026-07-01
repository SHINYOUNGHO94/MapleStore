import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import { todayInputValue } from '../lib/calculations'
import { fromMeso, toMeso } from '../lib/units'
import BossPicker from './BossPicker'
import GoldAmountFields from './GoldAmountFields'
import type { Account, EntryType, LedgerEntry, LedgerEntryDraft } from '../types'
import type { T } from '../lib/i18n'

type FormState = {
  occurred_on: string
  entry_type: EntryType
  account_id: string
  amountEok: string
  amountMan: string
  boss_name: string
  memo: string
}

type TypeGroup = {
  labelKey: 'typeGroupIncome' | 'typeGroupCost' | 'typeGroupSettle'
  tone: 'income' | 'debt' | 'neutral'
  types: EntryType[]
}

const TYPE_GROUPS: TypeGroup[] = [
  { labelKey: 'typeGroupIncome', tone: 'income', types: ['boss_income'] },
  { labelKey: 'typeGroupCost', tone: 'debt', types: ['boss_cost_my', 'boss_cost_girlfriend'] },
  { labelKey: 'typeGroupSettle', tone: 'neutral', types: ['repay_girlfriend', 'withdraw_my_share', 'adjustment'] },
]

function buildInitialForm(accounts: Account[], entry?: LedgerEntry): FormState {
  const fallbackAccountId = accounts.find(a => !a.is_mine)?.id ?? accounts[0]?.id ?? ''
  if (entry) {
    const { eok, man } = fromMeso(Number(entry.amount_meso))
    return {
      occurred_on: entry.occurred_on,
      entry_type: entry.entry_type,
      account_id: entry.account_id,
      amountEok: eok,
      amountMan: man,
      boss_name: entry.boss_name ?? '',
      memo: entry.memo ?? '',
    }
  }
  return {
    occurred_on: todayInputValue(),
    entry_type: 'boss_income',
    account_id: fallbackAccountId,
    amountEok: '',
    amountMan: '',
    boss_name: '',
    memo: '',
  }
}

type Props = {
  t: T
  accounts: Account[]
  initialEntry?: LedgerEntry
  saving: boolean
  onSave: (draft: LedgerEntryDraft) => Promise<void>
  onSaveMany?: (drafts: LedgerEntryDraft[]) => Promise<void>
  onCancel?: () => void
}

export default function EntryForm({ t, accounts, initialEntry, saving, onSave, onSaveMany, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(accounts, initialEntry))
  const [error, setError] = useState('')
  const [beforeEok, setBeforeEok] = useState('')
  const [beforeMan, setBeforeMan] = useState('')
  const [afterEok, setAfterEok] = useState('')
  const [afterMan, setAfterMan] = useState('')
  const [calcError, setCalcError] = useState('')
  const [bossMode, setBossMode] = useState<'preset' | 'manual'>('preset')

  useEffect(() => {
    setForm(buildInitialForm(accounts, initialEntry))
    setError('')
    setBeforeEok('')
    setBeforeMan('')
    setAfterEok('')
    setAfterMan('')
    setCalcError('')
  }, [initialEntry, accounts])

  const showBalanceCalc = form.entry_type === 'boss_cost_girlfriend'
  const isBossIncome = form.entry_type === 'boss_income'
  const showBossPicker = isBossIncome && !initialEntry && bossMode === 'preset' && Boolean(onSaveMany)
  const showBossNameField = form.entry_type === 'boss_income'

  function handleCalcDiff() {
    setCalcError('')
    const before = toMeso(beforeEok, beforeMan)
    const after = toMeso(afterEok, afterMan)
    const diff = before - after
    if (diff <= 0) {
      setCalcError(t.form.calcNotPositiveError)
      return
    }
    const { eok, man } = fromMeso(diff)
    setForm(prev => ({ ...prev, amountEok: eok, amountMan: man }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (showBossPicker) return
    setError('')
    const amount_meso = toMeso(form.amountEok, form.amountMan)
    if (amount_meso <= 0) {
      setError(t.form.amountError)
      return
    }
    if (!form.account_id) {
      setError(t.form.accountError)
      return
    }
    const draft: LedgerEntryDraft = {
      occurred_on: form.occurred_on,
      entry_type: form.entry_type,
      account_id: form.account_id,
      amount_meso,
      boss_name: form.boss_name.trim() || null,
      memo: form.memo.trim() || null,
    }
    await onSave(draft)
  }

  return (
    <form className="entry-form" onSubmit={e => void handleSubmit(e)}>
      <div className="section-heading">
        <h2>{initialEntry ? t.form.editTitle : t.form.addTitle}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onCancel && (
            <button className="icon-button" type="button" onClick={onCancel} title={t.form.cancel}>
              <X size={18} />
            </button>
          )}
          {!showBossPicker && (
            <button className="primary-button" type="submit" disabled={saving}>
              <Save size={18} aria-hidden="true" />
              {initialEntry
                ? (saving ? t.form.saving : t.form.save)
                : (saving ? t.form.adding : t.form.add)}
            </button>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <label className="field">
        <span>{t.form.date}</span>
        <input
          type="date"
          value={form.occurred_on}
          onChange={e => setForm(prev => ({ ...prev, occurred_on: e.target.value }))}
        />
      </label>

      <div className="field">
        <span>{t.form.type}</span>
        <div className="type-groups">
          {TYPE_GROUPS.map(group => (
            <div key={group.labelKey} className={`type-group ${group.tone}`}>
              <span className="type-group-label">{t.form[group.labelKey]}</span>
              <div className="segmented-grid" style={{ gridTemplateColumns: `repeat(${group.types.length}, minmax(0, 1fr))` }}>
                {group.types.map(type => (
                  <button
                    key={type}
                    className={form.entry_type === type ? 'selected' : ''}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, entry_type: type }))}
                  >
                    {t.entryTypes[type] ?? type}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="field">
        <span>{t.form.account}</span>
        <p className="field-hint">{t.form.accountHint}</p>
        <div className="segmented-grid">
          {accounts.map(account => (
            <button
              key={account.id}
              className={form.account_id === account.id ? 'selected' : ''}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, account_id: account.id }))}
            >
              {account.name}
            </button>
          ))}
        </div>
      </div>

      {isBossIncome && onSaveMany && !initialEntry && (
        <div className="segmented-control">
          <button
            className={bossMode === 'preset' ? 'selected' : ''}
            type="button"
            onClick={() => setBossMode('preset')}
          >
            {t.form.bossPresetMode}
          </button>
          <button
            className={bossMode === 'manual' ? 'selected' : ''}
            type="button"
            onClick={() => setBossMode('manual')}
          >
            {t.form.bossManualMode}
          </button>
        </div>
      )}

      {showBossPicker && onSaveMany ? (
        <BossPicker
          t={t}
          occurredOn={form.occurred_on}
          accountId={form.account_id}
          saving={saving}
          onSaveMany={onSaveMany}
        />
      ) : (
        <>
          {showBalanceCalc && (
            <div className="balance-calc">
              <span className="balance-calc-title">{t.form.calcTitle}</span>
              <span className="balance-calc-sub">{t.form.beforeGold}</span>
              <GoldAmountFields t={t} eok={beforeEok} man={beforeMan} onEokChange={setBeforeEok} onManChange={setBeforeMan} />
              <span className="balance-calc-sub">{t.form.afterGold}</span>
              <GoldAmountFields t={t} eok={afterEok} man={afterMan} onEokChange={setAfterEok} onManChange={setAfterMan} />
              {calcError && <div className="form-error">{calcError}</div>}
              <button className="icon-text-button" type="button" onClick={handleCalcDiff}>
                {t.form.calcButton}
              </button>
            </div>
          )}

          <div className="field">
            <span>{t.form.amount}</span>
            <GoldAmountFields
              t={t}
              eok={form.amountEok}
              man={form.amountMan}
              onEokChange={v => setForm(prev => ({ ...prev, amountEok: v }))}
              onManChange={v => setForm(prev => ({ ...prev, amountMan: v }))}
            />
          </div>

          {showBossNameField && (
            <label className="field">
              <span>{t.form.boss}</span>
              <input
                placeholder={t.form.bossPlaceholder}
                value={form.boss_name}
                onChange={e => setForm(prev => ({ ...prev, boss_name: e.target.value }))}
              />
            </label>
          )}

          <label className="field">
            <span>{t.form.memo}</span>
            <textarea
              rows={2}
              placeholder={t.form.memoPlaceholder}
              value={form.memo}
              onChange={e => setForm(prev => ({ ...prev, memo: e.target.value }))}
            />
          </label>
        </>
      )}
    </form>
  )
}
