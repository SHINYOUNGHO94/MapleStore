import { useMemo, useState } from 'react'
import { Gem, Swords } from 'lucide-react'
import { applyLostArkFee, buildLostArkSummary } from '../lib/financeCalculations'
import { formatLostArkGold, formatNumber } from '../lib/format'
import { todayInputValue } from '../lib/calculations'
import type { T } from '../lib/i18n'
import type { EntryDirection, LostArkEntry, LostArkEntryDraft } from '../types'
import FinanceEntryRow from './FinanceEntryRow'

type Props = {
  t: T
  entries: LostArkEntry[]
  loading: boolean
  saving: boolean
  onSave: (draft: LostArkEntryDraft) => Promise<void> | void
  onDelete: (id: string) => void
}

export default function LostArkPanel({ t, entries, loading, saving, onSave, onDelete }: Props) {
  const [occurredOn, setOccurredOn] = useState(todayInputValue())
  const [direction, setDirection] = useState<EntryDirection>('deposit')
  const [feeApplied, setFeeApplied] = useState(true)
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const summary = useMemo(() => buildLostArkSummary(entries), [entries])
  const numericAmount = Math.max(0, Math.floor(Number(amount) || 0))
  const netAmount = direction === 'deposit' ? applyLostArkFee(numericAmount, feeApplied) : numericAmount
  const feeAmount = Math.max(0, numericAmount - netAmount)
  const goldFmt = (value: number) => formatLostArkGold(value, t.finance.goldUnit)
  const recentEntries = entries.slice(0, 8)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t.finance.lostArkAmountError)
      return
    }

    setError('')
    await onSave({
      occurred_on: occurredOn,
      direction,
      gross_gold: numericAmount,
      net_gold: netAmount,
      fee_applied: direction === 'deposit' && feeApplied,
      memo: memo.trim() || null,
    })
    setAmount('')
    setMemo('')
    setFeeApplied(true)
  }

  return (
    <div className="screen-stack finance-screen lostark-screen">
      <section className="finance-hero lostark-hero">
        <div>
          <p className="eyebrow">LostArk</p>
          <h2>{t.finance.lostArkTitle}</h2>
          <p>{t.finance.lostArkDesc}</p>
        </div>
        <div className="finance-hero-mark">
          <Swords size={34} />
        </div>
      </section>

      <section className="summary-grid finance-summary-grid">
        <FinanceSummaryCard t={t} icon={<Gem size={20} />} label={t.finance.currentGold} value={goldFmt(summary.balanceGold)} tone="good" />
        <FinanceSummaryCard t={t} icon={<Gem size={20} />} label={t.finance.depositTotal} value={goldFmt(summary.depositGold)} tone="accent" />
        <FinanceSummaryCard t={t} icon={<Gem size={20} />} label={t.finance.withdrawalTotal} value={goldFmt(summary.withdrawalGold)} tone="danger" />
        <FinanceSummaryCard t={t} icon={<Gem size={20} />} label={t.finance.feeTotal} value={goldFmt(summary.feeGold)} tone="accent" />
      </section>

      <section className="finance-grid">
        <form className="entry-form finance-form" onSubmit={event => void submit(event)}>
          <div className="section-heading">
            <h2>{t.finance.lostArkFormTitle}</h2>
          </div>

          <label className="field">
            <span>{t.finance.date}</span>
            <input type="date" value={occurredOn} onChange={event => setOccurredOn(event.target.value)} />
          </label>

          <div className="field">
            <span>{t.finance.direction}</span>
            <div className="segmented-control">
              <button
                className={direction === 'deposit' ? 'selected' : ''}
                type="button"
                onClick={() => {
                  setDirection('deposit')
                  setFeeApplied(true)
                }}
              >
                {t.finance.deposit}
              </button>
              <button
                className={direction === 'withdraw' ? 'selected' : ''}
                type="button"
                onClick={() => setDirection('withdraw')}
              >
                {t.finance.withdraw}
              </button>
            </div>
          </div>

          <label className="field">
            <span>{direction === 'deposit' ? t.finance.sellGold : t.finance.withdrawGold}</span>
            <input inputMode="numeric" min="0" type="number" placeholder={t.finance.amountPlaceholder} value={amount} onChange={event => setAmount(event.target.value)} />
          </label>

          {direction === 'deposit' && (
            <label className="account-mine-check fee-check">
              <input type="checkbox" checked={feeApplied} onChange={event => setFeeApplied(event.target.checked)} />
              {t.finance.feeCheck}
            </label>
          )}

          <div className="balance-calc">
            <span className="balance-calc-title">{t.finance.recordedGold}</span>
            <strong>{goldFmt(netAmount)}</strong>
            {direction === 'deposit' && feeApplied && (
              <span className="balance-calc-sub">{t.finance.feeExcluded.replace('{amount}', formatNumber(feeAmount))}</span>
            )}
          </div>

          <label className="field">
            <span>{t.finance.memo}</span>
            <textarea placeholder={t.finance.lostArkMemoPlaceholder} value={memo} onChange={event => setMemo(event.target.value)} />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? t.finance.saving : t.finance.lostArkSave}
          </button>
        </form>

        <section className="records-panel finance-records-panel">
          <div className="section-heading">
            <h2>{t.finance.recentLostArk}</h2>
            <span className="count-pill">{entries.length}{t.misc.records}</span>
          </div>
          {loading ? (
            <div className="empty-state">{t.finance.loading}</div>
          ) : recentEntries.length === 0 ? (
            <div className="empty-state mascot-empty">{t.finance.noLostArk}</div>
          ) : (
            <div className="entry-list">
              {recentEntries.map(entry => (
                <FinanceEntryRow key={entry.id} t={t} kind="lostark" entry={entry} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

function FinanceSummaryCard({
  t, icon, label, value, tone,
}: {
  t: T
  icon: React.ReactNode
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
