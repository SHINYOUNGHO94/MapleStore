import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import { todayInputValue } from '../lib/calculations'
import { floorToMan, fromMeso, toMeso } from '../lib/units'
import BossPicker from './BossPicker'
import GoldAmountFields from './GoldAmountFields'
import ItemPicker from './ItemPicker'
import type { Account, EntryType, LedgerEntry, LedgerEntryDraft } from '../types'
import { formatMesoT, type T } from '../lib/i18n'

type FormState = {
  occurred_on: string
  entry_type: EntryType
  account_id: string
  amountEok: string
  amountMan: string
  boss_name: string
  memo: string
}

type ShareSplit = {
  total: number
  borrowed: number
  contribution: number
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

const CONTRIBUTION_EDIT_GROUP: TypeGroup = {
  labelKey: 'typeGroupSettle',
  tone: 'neutral',
  types: ['girlfriend_contribution'],
}

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
  const [costMode, setCostMode] = useState<'items' | 'manual'>('items')
  const [shareSplit, setShareSplit] = useState<ShareSplit | null>(null)

  useEffect(() => {
    setForm(buildInitialForm(accounts, initialEntry))
    setError('')
    setBeforeEok('')
    setBeforeMan('')
    setAfterEok('')
    setAfterMan('')
    setCalcError('')
    setCostMode('items')
    setShareSplit(null)
  }, [initialEntry, accounts])

  const isBorrowedCost = form.entry_type === 'boss_cost_girlfriend'
  const showBalanceCalc = isBorrowedCost
  const isBossIncome = form.entry_type === 'boss_income'
  const showBossPicker = isBossIncome && !initialEntry && bossMode === 'preset' && Boolean(onSaveMany)
  const showCostModes = isBorrowedCost && !initialEntry && Boolean(onSaveMany)
  const showItemPicker = showCostModes && costMode === 'items' && Boolean(onSaveMany)
  const showPresetPicker = showBossPicker || showItemPicker
  const showBossNameField = form.entry_type === 'boss_income'
  const showItemNameField = form.entry_type === 'boss_cost_my' || isBorrowedCost || form.entry_type === 'girlfriend_contribution'
  const typeGroups = initialEntry?.entry_type === 'girlfriend_contribution'
    ? [...TYPE_GROUPS, CONTRIBUTION_EDIT_GROUP]
    : TYPE_GROUPS

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
    setShareSplit(null)
  }

  function handleApplyShare() {
    setError('')
    const total = toMeso(form.amountEok, form.amountMan)
    if (total <= 0) {
      setError(t.form.shareCostError)
      return
    }
    const contribution = floorToMan(total / 3)
    const borrowed = total - contribution
    const { eok, man } = fromMeso(borrowed)
    setForm(prev => ({ ...prev, amountEok: eok, amountMan: man }))
    setShareSplit({ total, borrowed, contribution })
  }

  function setAmountEok(value: string) {
    setShareSplit(null)
    setForm(prev => ({ ...prev, amountEok: value }))
  }

  function setAmountMan(value: string) {
    setShareSplit(null)
    setForm(prev => ({ ...prev, amountMan: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (showPresetPicker) return
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
    if (shareSplit && isBorrowedCost && onSaveMany && !initialEntry) {
      const itemName = form.boss_name.trim() || t.form.itemName
      await onSaveMany([
        {
          ...draft,
          amount_meso: shareSplit.borrowed,
          memo: [draft.memo, t.form.shareCostApplied].filter(Boolean).join(' / ') || null,
        },
        {
          ...draft,
          entry_type: 'girlfriend_contribution',
          amount_meso: shareSplit.contribution,
          boss_name: itemName,
          memo: `${t.form.shareCostTotal} ${formatMesoT(shareSplit.total, t.units)}`,
        },
      ])
      return
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
          {!showPresetPicker && (
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
          {typeGroups.map(group => (
            <div key={group.labelKey} className={`type-group ${group.tone}`}>
              <span className="type-group-label">{t.form[group.labelKey]}</span>
              <div className="segmented-grid" style={{ gridTemplateColumns: `repeat(${group.types.length}, minmax(0, 1fr))` }}>
                {group.types.map(type => (
                  <button
                    key={type}
                    className={form.entry_type === type ? 'selected' : ''}
                    type="button"
                    onClick={() => {
                      setShareSplit(null)
                      setForm(prev => ({ ...prev, entry_type: type }))
                    }}
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

      {showCostModes && (
        <div className="segmented-control">
          <button
            className={costMode === 'items' ? 'selected' : ''}
            type="button"
            onClick={() => setCostMode('items')}
          >
            {t.form.costItemMode}
          </button>
          <button
            className={costMode === 'manual' ? 'selected' : ''}
            type="button"
            onClick={() => setCostMode('manual')}
          >
            {t.form.costManualMode}
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
      ) : showItemPicker && onSaveMany ? (
        <ItemPicker
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
              onEokChange={setAmountEok}
              onManChange={setAmountMan}
            />
            {isBorrowedCost && !initialEntry && onSaveMany && (
              <div className="share-cost-panel">
                <button className="icon-text-button" type="button" onClick={handleApplyShare}>
                  {t.form.shareCostButton}
                </button>
                {shareSplit && (
                  <div className="share-cost-summary">
                    <span>{t.form.shareCostApplied}</span>
                    <strong>{t.form.shareCostBorrowed}: {formatShare(shareSplit.borrowed, t)}</strong>
                    <strong>{t.form.shareCostContribution}: {formatShare(shareSplit.contribution, t)}</strong>
                  </div>
                )}
              </div>
            )}
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

          {showItemNameField && (
            <label className="field">
              <span>{t.form.itemName}</span>
              <input
                placeholder={t.form.itemNamePlaceholder}
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

function formatShare(value: number, t: T) {
  return formatMesoT(value, t.units)
}
