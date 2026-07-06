import { useMemo, useState } from 'react'
import { Gem, Swords } from 'lucide-react'
import { applyLostArkFee, buildLostArkSummary } from '../lib/financeCalculations'
import { formatLostArkGold, formatNumber } from '../lib/format'
import { todayInputValue } from '../lib/calculations'
import type { EntryDirection, LostArkEntry, LostArkEntryDraft } from '../types'
import FinanceEntryRow from './FinanceEntryRow'

type Props = {
  entries: LostArkEntry[]
  loading: boolean
  saving: boolean
  onSave: (draft: LostArkEntryDraft) => Promise<void> | void
  onDelete: (id: string) => void
}

export default function LostArkPanel({ entries, loading, saving, onSave, onDelete }: Props) {
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
  const recentEntries = entries.slice(0, 8)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('골드를 입력하세요.')
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
          <h2>LostArk 아야짱 골드</h2>
          <p>아이템 판매 수익은 기본 5% 수수료를 제외하고 기록합니다.</p>
        </div>
        <div className="finance-hero-mark">
          <Swords size={34} />
        </div>
      </section>

      <section className="summary-grid finance-summary-grid">
        <FinanceSummaryCard icon={<Gem size={20} />} label="현재 골드" value={formatLostArkGold(summary.balanceGold)} tone="good" />
        <FinanceSummaryCard icon={<Gem size={20} />} label="입금 누적" value={formatLostArkGold(summary.depositGold)} tone="accent" />
        <FinanceSummaryCard icon={<Gem size={20} />} label="출금 누적" value={formatLostArkGold(summary.withdrawalGold)} tone="danger" />
        <FinanceSummaryCard icon={<Gem size={20} />} label="수수료 누적" value={formatLostArkGold(summary.feeGold)} tone="accent" />
      </section>

      <section className="finance-grid">
        <form className="entry-form finance-form" onSubmit={event => void submit(event)}>
          <div className="section-heading">
            <h2>LostArk 입출금</h2>
          </div>

          <label className="field">
            <span>날짜</span>
            <input type="date" value={occurredOn} onChange={event => setOccurredOn(event.target.value)} />
          </label>

          <div className="field">
            <span>종류</span>
            <div className="segmented-control">
              <button
                className={direction === 'deposit' ? 'selected' : ''}
                type="button"
                onClick={() => {
                  setDirection('deposit')
                  setFeeApplied(true)
                }}
              >
                입금
              </button>
              <button
                className={direction === 'withdraw' ? 'selected' : ''}
                type="button"
                onClick={() => setDirection('withdraw')}
              >
                출금
              </button>
            </div>
          </div>

          <label className="field">
            <span>{direction === 'deposit' ? '판매 골드' : '출금 골드'}</span>
            <input inputMode="numeric" min="0" type="number" placeholder="예: 100000" value={amount} onChange={event => setAmount(event.target.value)} />
          </label>

          {direction === 'deposit' && (
            <label className="account-mine-check fee-check">
              <input type="checkbox" checked={feeApplied} onChange={event => setFeeApplied(event.target.checked)} />
              수수료 5% 적용
            </label>
          )}

          <div className="balance-calc">
            <span className="balance-calc-title">기록될 골드</span>
            <strong>{formatLostArkGold(netAmount)}</strong>
            {direction === 'deposit' && feeApplied && (
              <span className="balance-calc-sub">수수료 {formatNumber(feeAmount)}골드 제외</span>
            )}
          </div>

          <label className="field">
            <span>메모</span>
            <textarea placeholder="예: 보석 판매, 악세 판매" value={memo} onChange={event => setMemo(event.target.value)} />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? '저장 중' : 'LostArk 기록 추가'}
          </button>
        </form>

        <section className="records-panel finance-records-panel">
          <div className="section-heading">
            <h2>최근 LostArk 기록</h2>
            <span className="count-pill">{entries.length}건</span>
          </div>
          {loading ? (
            <div className="empty-state">불러오는 중</div>
          ) : recentEntries.length === 0 ? (
            <div className="empty-state mascot-empty">아직 LostArk 기록이 없습니다.</div>
          ) : (
            <div className="entry-list">
              {recentEntries.map(entry => (
                <FinanceEntryRow key={entry.id} kind="lostark" entry={entry} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

function FinanceSummaryCard({
  icon, label, value, tone,
}: {
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
      <span className="summary-sub">누적</span>
    </article>
  )
}
