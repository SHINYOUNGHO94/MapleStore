import { BarChart3, Coins, TrendingUp, WalletCards } from 'lucide-react'
import type { Summary } from '../lib/calculations'
import { formatMesoT, type T } from '../lib/i18n'
import type { Account, LedgerEntry } from '../types'
import { EntryRow } from './EntryRow'

type Props = {
  t: T
  summary: Summary
  accounts: Account[]
  weekStart: string
  recentEntries: LedgerEntry[]
  loading: boolean
  onAdd: () => void
  onEdit: (entry: LedgerEntry) => void
  onDelete: (id: string) => void
}

export default function Dashboard({
  t,
  summary,
  accounts,
  weekStart,
  recentEntries,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const fmt = (v: number) => formatMesoT(v, t.units)
  const girlfriendAccounts = accounts.filter(a => !a.is_mine)
  const accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))
  const claimLabel = girlfriendAccounts.length === 1
    ? `${girlfriendAccounts[0].name} ${t.dashboard.myMoneySuffix}`
    : t.dashboard.myClaimInGfAccount

  return (
    <div className="screen-stack">
      <section className="summary-grid" aria-label="status">
        <SummaryCard
          icon={<WalletCards size={20} />}
          label={t.dashboard.debtToGf}
          value={fmt(summary.debtToGirlfriend)}
          tone={summary.debtToGirlfriend > 0 ? 'danger' : 'good'}
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
          icon={<Coins size={20} />}
          label={t.dashboard.girlfriendContribution}
          value={fmt(summary.girlfriendContribution)}
          tone="good"
          sub={t.dashboard.girlfriendContributionSub}
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label={t.dashboard.thisWeekNet}
          value={fmt(summary.thisWeekNet)}
          tone={summary.thisWeekNet >= 0 ? 'good' : 'danger'}
          sub={weekStart}
        />
        <SummaryCard
          icon={<BarChart3 size={20} />}
          label={t.dashboard.cumulativeNet}
          value={fmt(summary.netBossProfit)}
          tone={summary.netBossProfit >= 0 ? 'accent' : 'danger'}
          sub={t.dashboard.wholeperiod}
        />
      </section>

      {girlfriendAccounts.length > 0 && (
        <section className="metric-strip">
          {girlfriendAccounts.map(account => (
            <Metric
              key={account.id}
              label={`${account.name} ${t.dashboard.myMoneySuffix}`}
              value={fmt(summary.myClaimByAccount[account.id] ?? 0)}
            />
          ))}
        </section>
      )}

      <section className="metric-strip">
        <Metric label={t.dashboard.bossTotal}    value={fmt(summary.bossIncome)} />
        <Metric label={t.dashboard.bossCostTotal} value={fmt(summary.totalBossCost)} />
        <Metric label={t.dashboard.repayTotal}    value={fmt(summary.repaidToGirlfriend)} />
        <Metric label={t.dashboard.thisWeekIncome} value={fmt(summary.thisWeekBossIncome)} />
      </section>

      <section className="chart-block">
        <CompareBar
          title={t.dashboard.thisWeekChart}
          leftLabel={t.dashboard.bossTotal}
          leftValue={summary.thisWeekBossIncome}
          leftFmt={fmt(summary.thisWeekBossIncome)}
          rightLabel={t.dashboard.bossCostTotal}
          rightValue={summary.thisWeekBossCost}
          rightFmt={fmt(summary.thisWeekBossCost)}
        />
        <CompareBar
          title={t.dashboard.overallChart}
          leftLabel={t.dashboard.myClaimInGfAccount}
          leftValue={summary.myClaimOnGirlfriendAccount}
          leftFmt={fmt(summary.myClaimOnGirlfriendAccount)}
          rightLabel={t.dashboard.debtToGf}
          rightValue={summary.debtToGirlfriend}
          rightFmt={fmt(summary.debtToGirlfriend)}
        />
      </section>

      <div className="section-heading">
        <h2>{t.dashboard.recentRecords}</h2>
        <button className="icon-text-button" type="button" onClick={onAdd}>
          {t.dashboard.addRecord}
        </button>
      </div>

      {loading ? (
        <div className="empty-state">{t.dashboard.loading}</div>
      ) : recentEntries.length === 0 ? (
        <div className="empty-state">{t.dashboard.noRecord}</div>
      ) : (
        <div className="entry-list">
          {recentEntries.map(entry => (
            <EntryRow key={entry.id} t={t} entry={entry} accountNames={accountNames} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function CompareBar({
  title, leftLabel, leftValue, leftFmt, rightLabel, rightValue, rightFmt,
}: {
  title: string
  leftLabel: string
  leftValue: number
  leftFmt: string
  rightLabel: string
  rightValue: number
  rightFmt: string
}) {
  const left = Math.max(0, leftValue)
  const right = Math.max(0, rightValue)
  const total = left + right
  const leftPercent = total > 0 ? (left / total) * 100 : 50

  return (
    <div className="compare-bar">
      <span className="compare-bar-title">{title}</span>
      <div className="compare-bar-track" aria-hidden="true">
        <div className="compare-bar-fill" style={{ width: `${leftPercent}%` }} />
      </div>
      <div className="compare-bar-legend">
        <span className="compare-bar-item good">{leftLabel} <strong>{leftFmt}</strong></span>
        <span className="compare-bar-item danger">{rightLabel} <strong>{rightFmt}</strong></span>
      </div>
    </div>
  )
}
