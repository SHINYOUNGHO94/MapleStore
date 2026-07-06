import { useMemo, useState } from 'react'
import { CircleDollarSign, Landmark } from 'lucide-react'
import { buildCashSummary } from '../lib/financeCalculations'
import { formatCash } from '../lib/format'
import { todayInputValue } from '../lib/calculations'
import type { CashCurrency, CashEntry, CashEntryDraft, CashGame, EntryDirection } from '../types'
import FinanceEntryRow from './FinanceEntryRow'

type Props = {
  entries: CashEntry[]
  loading: boolean
  saving: boolean
  onSave: (draft: CashEntryDraft) => Promise<void> | void
  onDelete: (id: string) => void
}

export default function CashBankPanel({ entries, loading, saving, onSave, onDelete }: Props) {
  const [occurredOn, setOccurredOn] = useState(todayInputValue())
  const [game, setGame] = useState<CashGame>('maple')
  const [direction, setDirection] = useState<EntryDirection>('deposit')
  const [currency, setCurrency] = useState<CashCurrency>('KRW')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const summary = useMemo(() => buildCashSummary(entries), [entries])
  const recentEntries = entries.slice(0, 8)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const numericAmount = Math.floor(Number(amount))
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('금액을 입력하세요.')
      return
    }

    setError('')
    await onSave({
      occurred_on: occurredOn,
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
    <div className="screen-stack finance-screen cash-screen">
      <section className="finance-hero cash-hero">
        <div>
          <p className="eyebrow">Cash Bank</p>
          <h2>아야짱 현금통장</h2>
          <p>Maple과 LostArk 재화를 현금으로 팔았을 때 아야짱 몫만 기록합니다.</p>
        </div>
        <div className="finance-hero-mark">
          <CircleDollarSign size={34} />
        </div>
      </section>

      <section className="summary-grid finance-summary-grid">
        <FinanceSummaryCard icon={<Landmark size={20} />} label="원화 잔액" value={formatCash(summary.balances.KRW, 'KRW')} tone="good" />
        <FinanceSummaryCard icon={<Landmark size={20} />} label="엔화 잔액" value={formatCash(summary.balances.JPY, 'JPY')} tone="accent" />
        <FinanceSummaryCard icon={<CircleDollarSign size={20} />} label="원화 입금" value={formatCash(summary.deposits.KRW, 'KRW')} tone="accent" />
        <FinanceSummaryCard icon={<CircleDollarSign size={20} />} label="엔화 입금" value={formatCash(summary.deposits.JPY, 'JPY')} tone="accent" />
      </section>

      <section className="finance-grid">
        <form className="entry-form finance-form" onSubmit={event => void submit(event)}>
          <div className="section-heading">
            <h2>현금 입출금</h2>
          </div>

          <label className="field">
            <span>날짜</span>
            <input type="date" value={occurredOn} onChange={event => setOccurredOn(event.target.value)} />
          </label>

          <div className="field">
            <span>게임</span>
            <div className="segmented-control">
              <button className={game === 'maple' ? 'selected' : ''} type="button" onClick={() => setGame('maple')}>Maple</button>
              <button className={game === 'lostark' ? 'selected' : ''} type="button" onClick={() => setGame('lostark')}>LostArk</button>
            </div>
          </div>

          <div className="field">
            <span>종류</span>
            <div className="segmented-control">
              <button className={direction === 'deposit' ? 'selected' : ''} type="button" onClick={() => setDirection('deposit')}>입금</button>
              <button className={direction === 'withdraw' ? 'selected' : ''} type="button" onClick={() => setDirection('withdraw')}>출금</button>
            </div>
          </div>

          <div className="field">
            <span>통화</span>
            <div className="segmented-control">
              <button className={currency === 'KRW' ? 'selected' : ''} type="button" onClick={() => setCurrency('KRW')}>원</button>
              <button className={currency === 'JPY' ? 'selected' : ''} type="button" onClick={() => setCurrency('JPY')}>엔</button>
            </div>
          </div>

          <label className="field">
            <span>금액</span>
            <input inputMode="numeric" min="0" type="number" placeholder="예: 150000" value={amount} onChange={event => setAmount(event.target.value)} />
          </label>

          <label className="field">
            <span>메모</span>
            <textarea placeholder="예: 검은마법사 메소 판매분" value={memo} onChange={event => setMemo(event.target.value)} />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? '저장 중' : '현금 기록 추가'}
          </button>
        </form>

        <section className="records-panel finance-records-panel">
          <div className="section-heading">
            <h2>최근 현금 기록</h2>
            <span className="count-pill">{entries.length}건</span>
          </div>
          {loading ? (
            <div className="empty-state">불러오는 중</div>
          ) : recentEntries.length === 0 ? (
            <div className="empty-state mascot-empty">아직 현금 기록이 없습니다.</div>
          ) : (
            <div className="entry-list">
              {recentEntries.map(entry => (
                <FinanceEntryRow key={entry.id} kind="cash" entry={entry} onDelete={onDelete} />
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
