import {
  CalendarDays,
  CircleDollarSign,
  Coins,
  JapaneseYen,
  Landmark,
  Pencil,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { getSettlementInfo, type Summary } from '../lib/calculations'
import type { CashSummary } from '../lib/financeCalculations'
import { formatCash } from '../lib/format'
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
  loading,
  onAdd,
  onLedger,
  onEdit,
}: Props) {
  const fmt = (v: number) => formatMesoT(v, t.units)
  const cashFmt = (v: number, currency: 'KRW' | 'JPY') => formatCash(v, currency, { KRW: t.finance.won, JPY: t.finance.yen })
  const girlfriendAccounts = accounts.filter(a => !a.is_mine)
  const settlement = getSettlementInfo(summary)
  const weekDays = buildWeekDays(entries, weekStart)
  const weekEnd = weekDays[weekDays.length - 1]?.date ?? weekStart
  const claimLabel = girlfriendAccounts.length === 1
    ? `${girlfriendAccounts[0].name} ${t.dashboard.myMoneySuffix}`
    : t.dashboard.myClaimInGfAccount

  return (
    <div className="screen-stack ipch-dashboard">
      <section className="ipch-hero">
        <div>
          <h2>{t.dashboard.greetingTitle} <span aria-hidden="true">👋</span></h2>
          <p>{t.dashboard.greetingSub}</p>
        </div>
        <div className="ipch-hero-actions">
          <div className="ipch-date-pill">
            <CalendarDays size={16} />
            <span>{weekStart} ~ {weekEnd}</span>
          </div>
          <button className="primary-button ipch-new-button" type="button" onClick={onAdd}>
            <Pencil size={16} />
            {t.dashboard.newEntry}
          </button>
        </div>
        <img className="ipch-hero-mascot" src="/assets/ipch/mascot-small.png" alt="" />
      </section>

      <section className="ipch-kpi-grid" aria-label="status">
        <SummaryCard
          icon={<WalletCards size={20} />}
          label={t.dashboard.debtToGf}
          value={fmt(summary.debtToGirlfriend)}
          tone="danger"
          sub={summary.debtToGirlfriend > 0 ? t.dashboard.repayNeeded : t.dashboard.noDebt}
        />
        <SummaryCard
          icon={<Coins size={20} />}
          label={claimLabel}
          value={fmt(summary.myClaimOnGirlfriendAccount)}
          tone="accent"
          sub={t.dashboard.waitingWithdraw}
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label={t.dashboard.myNetWorth}
          value={fmt(settlement.netWorth)}
          tone={settlement.netWorth >= 0 ? 'good' : 'danger'}
          sub={settlement.netWorth >= 0 ? t.dashboard.myNetWorthPositiveSub : t.dashboard.myNetWorthNegativeSub}
        />
        <SummaryCard
          icon={<CircleDollarSign size={20} />}
          label={t.dashboard.thisWeekNet}
          value={fmt(summary.thisWeekNet)}
          tone={summary.thisWeekNet >= 0 ? 'danger' : 'accent'}
          sub={weekStart}
        />
      </section>

      <section className="ipch-main-grid ipch-simple-grid">
        <article className="ipch-panel ipch-fund-panel">
          <h2>{t.dashboard.keyStatus}</h2>
          <div className="ipch-fund-list">
            <FundRow icon={<CircleDollarSign size={18} />} label={t.dashboard.bossTotal} value={fmt(summary.bossIncome)} tone="danger" />
            <FundRow icon={<WalletCards size={18} />} label={t.dashboard.bossCostTotal} value={fmt(summary.totalBossCost)} tone="good" />
            <FundRow icon={<ReceiptText size={18} />} label={t.dashboard.repayTotal} value={fmt(summary.repaidToGirlfriend)} tone="accent" />
            <FundRow icon={<Landmark size={18} />} label={t.dashboard.girlfriendContribution} value={fmt(summary.girlfriendContribution)} tone="good" />
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
          <WeekBars days={weekDays} fmt={fmt} t={t} />
          <div className="ipch-note-line">
            <img src="/assets/ipch/mascot-small.png" alt="" />
            <span>{t.dashboard.weeklyNote}</span>
          </div>
        </article>

        <article className="ipch-panel ipch-fund-panel">
          <h2>{t.dashboard.cashStatus}</h2>
          <div className="ipch-fund-list">
            <FundRow icon={<CircleDollarSign size={18} />} label={t.finance.cashWon} value={cashFmt(cashSummary.ownerBalances.aya.KRW, 'KRW')} tone="danger" />
            <FundRow icon={<JapaneseYen size={18} />} label={t.finance.cashYen} value={cashFmt(cashSummary.ownerBalances.aya.JPY, 'JPY')} tone="accent" />
            <FundRow icon={<CircleDollarSign size={18} />} label={t.finance.oppaCashWon} value={cashFmt(cashSummary.ownerBalances.oppa.KRW, 'KRW')} tone="danger" />
            <FundRow icon={<JapaneseYen size={18} />} label={t.finance.oppaCashYen} value={cashFmt(cashSummary.ownerBalances.oppa.JPY, 'JPY')} tone="accent" />
          </div>
        </article>
      </section>

      <section className="records-panel ipch-records-panel">
        <div className="section-heading">
          <h2>{t.dashboard.recentRecords}</h2>
          <button className="icon-text-button" type="button" onClick={onLedger}>
            {t.dashboard.viewAll}
          </button>
        </div>

        {loading ? (
          <div className="empty-state">{t.dashboard.loading}</div>
        ) : recentEntries.length === 0 ? (
          <div className="empty-state">{t.dashboard.noRecord}</div>
        ) : (
          <div className="ipch-transaction-table">
            <div className="ipch-transaction-head">
              <span>{t.dashboard.dateLabel}</span>
              <span>{t.dashboard.typeLabel}</span>
              <span>{t.dashboard.detailLabel}</span>
              <span>{t.dashboard.amountLabel}</span>
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

function WeekBars({ days, fmt, t }: { days: WeekDay[]; fmt: (value: number) => string; t: T }) {
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
        <span className="income">{t.dashboard.incomeLegend}</span>
        <span className="cost">{t.dashboard.costLegend}</span>
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
