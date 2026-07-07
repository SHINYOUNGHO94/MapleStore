import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { CircleDollarSign, Landmark, PiggyBank, ReceiptText } from 'lucide-react'
import { buildCashSummary } from '../lib/financeCalculations'
import { formatCash } from '../lib/format'
import { todayInputValue } from '../lib/calculations'
import type { T } from '../lib/i18n'
import type { CashCurrency, CashEntry, CashEntryDraft, CashGame, CashOwner, EntryDirection } from '../types'
import FinanceEntryRow from './FinanceEntryRow'

type Props = {
  t: T
  entries: CashEntry[]
  loading: boolean
  saving: boolean
  onSave: (draft: CashEntryDraft) => Promise<void> | void
  onDelete: (id: string) => void
}

export default function CashBankPanel({ t, entries, loading, saving, onSave, onDelete }: Props) {
  return (
    <div className="screen-stack finance-screen cash-screen">
      <section className="finance-hero cash-hero">
        <div>
          <p className="eyebrow">Cash Bank</p>
          <h2>{t.finance.cashTitle}</h2>
          <p>{t.finance.cashDesc}</p>
        </div>
        <div className="finance-hero-mark">
          <CircleDollarSign size={34} />
        </div>
      </section>

      <CashOwnerBank
        t={t}
        owner="aya"
        title={t.finance.cashAyaTitle}
        desc={t.finance.cashAyaDesc}
        entries={entries}
        loading={loading}
        saving={saving}
        onSave={onSave}
        onDelete={onDelete}
      />

      <CashOwnerBank
        t={t}
        owner="oppa"
        title={t.finance.cashOppaTitle}
        desc={t.finance.cashOppaDesc}
        entries={entries}
        loading={loading}
        saving={saving}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  )
}

function CashOwnerBank({
  t, owner, title, desc, entries, loading, saving, onSave, onDelete,
}: {
  t: T
  owner: CashOwner
  title: string
  desc: string
  entries: CashEntry[]
  loading: boolean
  saving: boolean
  onSave: (draft: CashEntryDraft) => Promise<void> | void
  onDelete: (id: string) => void
}) {
  const [occurredOn, setOccurredOn] = useState(todayInputValue())
  const [game, setGame] = useState<CashGame>('maple')
  const [direction, setDirection] = useState<EntryDirection>('deposit')
  const [currency, setCurrency] = useState<CashCurrency>('KRW')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const ownerEntries = useMemo(() => entries.filter(entry => entry.owner === owner), [entries, owner])
  const summary = useMemo(() => buildCashSummary(ownerEntries), [ownerEntries])
  const cashFmt = (value: number, targetCurrency: CashCurrency) => formatCash(value, targetCurrency, { KRW: t.finance.won, JPY: t.finance.yen })
  const cashPairFmt = (values: Record<CashCurrency, number>) => `${cashFmt(values.KRW, 'KRW')} · ${cashFmt(values.JPY, 'JPY')}`
  const recentEntries = ownerEntries.slice(0, 8)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const numericAmount = Math.floor(Number(amount))
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t.finance.cashAmountError)
      return
    }

    setError('')
    await onSave({
      occurred_on: occurredOn,
      owner,
      game,
      direction,
      currency,
      amount_cash: numericAmount,
      memo: memo.trim() || null,
    })
    setAmount('')
    setMemo('')
  }

  return (
    <section className="cash-owner-section">
      <div className="section-heading cash-owner-heading">
        <div>
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
        <span className="count-pill">{ownerEntries.length}{t.misc.records}</span>
      </div>

      <section className="summary-grid finance-summary-grid">
        <FinanceSummaryCard t={t} icon={<Landmark size={20} />} label={t.finance.wonBalance} value={cashFmt(summary.balances.KRW, 'KRW')} tone="good" />
        <FinanceSummaryCard t={t} icon={<Landmark size={20} />} label={t.finance.yenBalance} value={cashFmt(summary.balances.JPY, 'JPY')} tone="accent" />
        <FinanceSummaryCard t={t} icon={<PiggyBank size={20} />} label={t.finance.mapleIncome} value={cashPairFmt(summary.gameDeposits.maple)} tone="accent" />
        <FinanceSummaryCard t={t} icon={<ReceiptText size={20} />} label={t.finance.lostArkIncome} value={cashPairFmt(summary.gameDeposits.lostark)} tone="accent" />
      </section>

      <section className="finance-grid">
        <form className="entry-form finance-form" onSubmit={event => void submit(event)}>
          <div className="section-heading">
            <h2>{t.finance.cashFormTitle}</h2>
          </div>

          <label className="field">
            <span>{t.finance.date}</span>
            <input type="date" value={occurredOn} onChange={event => setOccurredOn(event.target.value)} />
          </label>

          <div className="field">
            <span>{t.finance.game}</span>
            <div className="segmented-control">
              <button className={game === 'maple' ? 'selected' : ''} type="button" onClick={() => setGame('maple')}>Maple</button>
              <button className={game === 'lostark' ? 'selected' : ''} type="button" onClick={() => setGame('lostark')}>LostArk</button>
            </div>
          </div>

          <div className="field">
            <span>{t.finance.direction}</span>
            <div className="segmented-control">
              <button className={direction === 'deposit' ? 'selected' : ''} type="button" onClick={() => setDirection('deposit')}>{t.finance.deposit}</button>
              <button className={direction === 'withdraw' ? 'selected' : ''} type="button" onClick={() => setDirection('withdraw')}>{t.finance.withdraw}</button>
            </div>
          </div>

          <div className="field">
            <span>{t.finance.currency}</span>
            <div className="segmented-control">
              <button className={currency === 'KRW' ? 'selected' : ''} type="button" onClick={() => setCurrency('KRW')}>{t.finance.won}</button>
              <button className={currency === 'JPY' ? 'selected' : ''} type="button" onClick={() => setCurrency('JPY')}>{t.finance.yen}</button>
            </div>
          </div>

          <label className="field">
            <span>{t.finance.amount}</span>
            <input inputMode="numeric" min="0" type="number" placeholder={t.finance.amountPlaceholder} value={amount} onChange={event => setAmount(event.target.value)} />
          </label>

          <label className="field">
            <span>{t.finance.memo}</span>
            <textarea placeholder={t.finance.cashMemoPlaceholder} value={memo} onChange={event => setMemo(event.target.value)} />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? t.finance.saving : t.finance.cashSave}
          </button>
        </form>

        <section className="records-panel finance-records-panel">
          <div className="section-heading">
            <h2>{t.finance.recentCash}</h2>
            <span className="count-pill">{ownerEntries.length}{t.misc.records}</span>
          </div>
          {loading ? (
            <div className="empty-state">{t.finance.loading}</div>
          ) : recentEntries.length === 0 ? (
            <div className="empty-state mascot-empty">{t.finance.noCash}</div>
          ) : (
            <div className="entry-list">
              {recentEntries.map(entry => (
                <FinanceEntryRow key={entry.id} t={t} kind="cash" entry={entry} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      </section>
    </section>
  )
}

function FinanceSummaryCard({
  t, icon, label, value, tone,
}: {
  t: T
  icon: ReactNode
  label: string
  value: string
  tone: 'good' | 'danger' | 'accent'
}) {
  return (
    <article className={`summary-card ${tone}`}>
      <div className="summary-icon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span className="summary-sub">{t.finance.cumulative}</span>
    </article>
  )
}
