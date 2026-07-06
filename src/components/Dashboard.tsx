import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Coins,
  Gem,
  JapaneseYen,
  Pencil,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { getSettlementInfo, type Summary } from '../lib/calculations'
import type { CashSummary, LostArkSummary } from '../lib/financeCalculations'
import { formatCash, formatLostArkGold } from '../lib/format'
import { formatMesoT, type T } from '../lib/i18n'
import type { Account, LedgerEntry } from '../types'

type Props = {
  t: T
  summary: Summary
  accounts: Account[]
  entries: LedgerEntry[]
  weekStart: string
  recentEntries: LedgerEntry[]
  cashSummary: CashSummary
  lostArkSummary: LostArkSummary
  loading: boolean
  onAdd: () => void
  onLedger: () => void
  onEdit: (entry: LedgerEntry) => void
}

export default function Dashboard({
  t,
  summary,
  accounts,
  entries,
  weekStart,
  recentEntries,
  cashSummary,
  lostArkSummary,
  loading,
  onAdd,
  onLedger,
  onEdit,
}: Props) {
  const fmt = (v: number) => formatMesoT(v, t.units)
  const cashFmt = (v: number, currency: 'KRW' | 'JPY') => formatCash(v, currency, { KRW: t.finance.won, JPY: t.finance.yen })
  const lostArkFmt = (v: number) => formatLostArkGold(v, t.finance.goldUnit)
  const girlfriendAccounts = accounts.filter(a => !a.is_mine)
  const settlement = getSettlementInfo(summary)
  const weekDays = buildWeekDays(entries, weekStart)
  const weekEnd = weekDays[weekDays.length - 1]?.date ?? weekStart
  const costRatio = summary.thisWeekBossIncome > 0
    ? Math.min(999, Math.round((summary.thisWeekBossCost / summary.thisWeekBossIncome) * 100))
    : 0
  const claimLabel = girlfriendAccounts.length === 1
    ? `${girlfriendAccounts[0].name} ${t.dashboard.myMoneySuffix}`
    : t.dashboard.myClaimInGfAccount

  return (
    <div className="screen-stack ipch-dashboard">
      <section className="ipch-hero">
        <div>
          <h2>안녕하세요, 데빌아야짱님! <span aria-hidden="true">👋</span></h2>
          <p>오늘도 똑똑한 소비 습관을 만들어봐요.</p>
        </div>
        <div className="ipch-hero-actions">
          <div className="ipch-date-pill">
            <CalendarDays size={16} />
            <span>{weekStart} ~ {weekEnd}</span>
          </div>
          <button className="primary-button ipch-new-button" type="button" onClick={onAdd}>
            <Pencil size={16} />
            새로 입력
          </button>
        </div>
        <img className="ipch-hero-mascot" src="/assets/ipch/mascot-small.png" alt="" />
      </section>

      <section className="ipch-kpi-grid" aria-label="status">
        <SummaryCard
          icon={<Coins size={20} />}
          label={t.dashboard.thisWeekNet}
          value={fmt(summary.thisWeekNet)}
          tone={summary.thisWeekNet >= 0 ? 'danger' : 'accent'}
          sub={weekStart}
        />
        <SummaryCard
          icon={<ArrowUpRight size={20} />}
          label={t.dashboard.bossCostTotal}
          value={fmt(summary.totalBossCost)}
          tone="accent"
          sub={t.finance.periodWeek}
        />
        <SummaryCard
          icon={<WalletCards size={20} />}
          label={t.dashboard.repayTotal}
          value={fmt(summary.repaidToGirlfriend)}
          tone="danger"
          sub={t.finance.periodWeek}
        />
        <SummaryCard
          icon={<PiggyBank size={20} />}
          label={t.dashboard.thisWeekChart}
          value={`${costRatio}%`}
          tone="accent"
          sub={t.dashboard.bossCostTotal}
        />
      </section>

      <section className="summary-grid finance-home-grid" aria-label="finance status">
        <SummaryCard
          icon={<CircleDollarSign size={20} />}
          label={t.finance.cashWon}
          value={cashFmt(cashSummary.balances.KRW, 'KRW')}
          tone={cashSummary.balances.KRW >= 0 ? 'accent' : 'danger'}
          sub={t.finance.cumulative}
        />
        <SummaryCard
          icon={<JapaneseYen size={20} />}
          label={t.finance.cashYen}
          value={cashFmt(cashSummary.balances.JPY, 'JPY')}
          tone={cashSummary.balances.JPY >= 0 ? 'accent' : 'danger'}
          sub={t.finance.cumulative}
        />
        <SummaryCard
          icon={<Gem size={20} />}
          label={t.finance.lostArkGold}
          value={lostArkFmt(lostArkSummary.balanceGold)}
          tone={lostArkSummary.balanceGold >= 0 ? 'accent' : 'danger'}
          sub={t.finance.cumulative}
        />
        <SummaryCard
          icon={<ReceiptText size={20} />}
          label={t.finance.lostArkFeeTotal}
          value={lostArkFmt(lostArkSummary.feeGold)}
          tone="accent"
          sub={t.finance.feeTotal}
        />
      </section>

      <section className="ipch-main-grid">
        <article className="ipch-panel ipch-fund-panel">
          <h2>자금 현황</h2>
          <div className="ipch-fund-list">
            <FundRow icon={<WalletCards size={18} />} label={t.dashboard.debtToGf} value={fmt(summary.debtToGirlfriend)} tone="danger" />
            <FundRow icon={<Coins size={18} />} label={claimLabel} value={fmt(summary.myClaimOnGirlfriendAccount)} tone="accent" />
            <FundRow icon={<TrendingUp size={18} />} label={t.dashboard.myNetWorth} value={fmt(settlement.netWorth)} tone="good" />
            <FundRow icon={<CircleDollarSign size={18} />} label={t.dashboard.girlfriendContribution} value={fmt(summary.girlfriendContribution)} tone="good" />
          </div>

          <div className="ipch-settlement-card">
            <div>
              <span>{t.dashboard.settlementStatus}</span>
              <strong>{fmt(settlement.netWorth)}</strong>
            </div>
            <img src="/assets/ipch/mascot-calculator.png" alt="" />
          </div>
        </article>

        <article className="ipch-panel ipch-chart-panel">
          <div className="ipch-panel-head">
            <div>
              <h2>{t.dashboard.thisWeekNet}</h2>
              <strong>{fmt(summary.thisWeekNet)}</strong>
            </div>
            <span className="count-pill">{t.finance.periodWeek}</span>
          </div>
          <WeekBars days={weekDays} fmt={fmt} />
          <div className="ipch-note-line">
            <img src="/assets/ipch/mascot-small.png" alt="" />
            <span>이번 주도 순수익이 좋아요! 계속 유지해봐요 ✨</span>
          </div>
        </article>

        <article className="ipch-panel ipch-week-panel">
          <h2>이번 주 요약</h2>
          <div className="ipch-summary-list">
            <FundRow icon={<CircleDollarSign size={18} />} label={t.dashboard.bossTotal} value={fmt(summary.bossIncome)} tone="danger" />
            <FundRow icon={<WalletCards size={18} />} label={t.dashboard.bossCostTotal} value={fmt(summary.totalBossCost)} tone="good" />
            <FundRow icon={<ReceiptText size={18} />} label={t.dashboard.repayTotal} value={fmt(summary.repaidToGirlfriend)} tone="accent" />
            <FundRow icon={<TrendingUp size={18} />} label={t.dashboard.thisWeekNet} value={fmt(summary.thisWeekNet)} tone="danger" />
          </div>
          <div className="ipch-cheer-card">
            <span>아주 잘하고 있어요!</span>
            <p>계속 꾸준히 기록해요 ♥</p>
            <img src="/assets/ipch/mascot-small.png" alt="" />
          </div>
        </article>
      </section>

      <section className="ipch-bottom-grid">
        <article className="records-panel ipch-records-panel">
          <div className="section-heading">
            <h2>{t.dashboard.recentRecords}</h2>
            <button className="icon-text-button" type="button" onClick={onLedger}>
              전체 보기
            </button>
          </div>

          {loading ? (
            <div className="empty-state">{t.dashboard.loading}</div>
          ) : recentEntries.length === 0 ? (
            <div className="empty-state">{t.dashboard.noRecord}</div>
          ) : (
            <div className="ipch-transaction-table">
              <div className="ipch-transaction-head">
                <span>날짜</span>
                <span>구분</span>
                <span>내역</span>
                <span>금액</span>
              </div>
              {recentEntries.slice(0, 5).map(entry => (
                <button
                  key={entry.id}
                  className="ipch-transaction-row"
                  type="button"
                  onClick={() => onEdit(entry)}
                >
                  <span>{entry.occurred_on}</span>
                  <span className={`ipch-entry-chip ${entry.entry_type}`}>{t.entryTypes[entry.entry_type] ?? entry.entry_type}</span>
                  <span>{entry.memo || entry.boss_name || '-'}</span>
                  <strong>{fmt(Number(entry.amount_meso))}</strong>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="ipch-panel ipch-today-card">
          <h2>오늘의 한마디</h2>
          <div>
            <p>기록하는 습관이<br />미래의 여유를<br />만들어요 💕</p>
            <img src="/assets/ipch/mascot-main.png" alt="" />
          </div>
        </article>
      </section>
    </div>
  )
}

function SummaryCard({
  icon, label, value, tone, sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'good' | 'danger' | 'accent'
  sub?: string
}) {
  return (
    <article className={`summary-card ${tone}`}>
      <div className="summary-icon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      {sub && <span className="summary-sub">{sub}</span>}
    </article>
  )
}

function FundRow({
  icon, label, value, tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'good' | 'danger' | 'accent'
}) {
  return (
    <div className={`ipch-fund-row ${tone}`}>
      <div className="ipch-row-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function WeekBars({ days, fmt }: { days: WeekDay[]; fmt: (value: number) => string }) {
  const maxValue = Math.max(1, ...days.flatMap(day => [day.income, day.cost]))

  return (
    <div className="ipch-week-chart">
      <div className="ipch-chart-area">
        {days.map(day => (
          <div key={day.date} className="ipch-day-bar" title={`${day.date} ${fmt(day.income - day.cost)}`}>
            <span className="ipch-bar-value">{day.income > 0 ? fmt(day.income) : ''}</span>
            <div className="ipch-bar-stack">
              <span className="ipch-bar-income" style={{ height: day.income > 0 ? `${Math.max(2, (day.income / maxValue) * 100)}%` : '0%' }} />
              <span className="ipch-bar-cost" style={{ height: day.cost > 0 ? `${Math.max(2, (day.cost / maxValue) * 100)}%` : '0%' }} />
            </div>
            <span className="ipch-bar-label">{day.label}</span>
          </div>
        ))}
      </div>
      <div className="ipch-chart-legend">
        <span className="income">수익</span>
        <span className="cost">지출</span>
      </div>
    </div>
  )
}

type WeekDay = {
  date: string
  label: string
  income: number
  cost: number
}

function buildWeekDays(entries: LedgerEntry[], weekStart: string): WeekDay[] {
  const start = parseDateOnly(weekStart)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const dateValue = toDateOnly(date)
    return {
      date: dateValue,
      label: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      income: 0,
      cost: 0,
    }
  })
  const byDate = new Map(days.map(day => [day.date, day]))

  for (const entry of entries) {
    const day = byDate.get(entry.occurred_on)
    if (!day) continue
    const amount = Math.max(0, Number(entry.amount_meso) || 0)
    if (entry.entry_type === 'boss_income') day.income += amount
    if (entry.entry_type === 'boss_cost_my' || entry.entry_type === 'boss_cost_girlfriend') day.cost += amount
  }

  return days
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateOnly(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
