import { BarChart3, CircleDollarSign, Coins, Gem, JapaneseYen, ReceiptText, TrendingUp, WalletCards } from 'lucide-react'
import { getSettlementInfo, type Summary } from '../lib/calculations'
import type { CashSummary, LostArkSummary } from '../lib/financeCalculations'
import { formatCash, formatLostArkGold } from '../lib/format'
import { formatMesoT, type T } from '../lib/i18n'
import type { Account, LedgerEntry } from '../types'
import { EntryRow } from './EntryRow'

type Props = {
  t: T
  summary: Summary
  accounts: Account[]
  weekStart: string
  recentEntries: LedgerEntry[]
  cashSummary: CashSummary
  lostArkSummary: LostArkSummary
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
  cashSummary,
  lostArkSummary,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const fmt = (v: number) => formatMesoT(v, t.units)
  const cashFmt = (v: number, currency: 'KRW' | 'JPY') => formatCash(v, currency, { KRW: t.finance.won, JPY: t.finance.yen })
  const lostArkFmt = (v: number) => formatLostArkGold(v, t.finance.goldUnit)
  const girlfriendAccounts = accounts.filter(a => !a.is_mine)
  const accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))
  const settlement = getSettlementInfo(summary)
  const claimLabel = girlfriendAccounts.length === 1
    ? `${girlfriendAccounts[0].name} ${t.dashboard.myMoneySuffix}`
    : t.dashboard.myClaimInGfAccount

  return (
    <div className="screen-stack">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Devil Aya Ledger</p>
          <h2>{t.header.title}</h2>
          <p>{t.finance.dashboardHeroSub}</p>
        </div>
      </section>

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
          icon={<WalletCards size={20} />}
          label={t.dashboard.myNetWorth}
          value={fmt(settlement.netWorth)}
          tone={settlement.netWorth >= 0 ? 'good' : 'danger'}
          sub={settlement.netWorth >= 0 ? t.dashboard.myNetWorthPositiveSub : t.dashboard.myNetWorthNegativeSub}
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

      <section className="summary-grid finance-home-grid" aria-label="finance status">
        <SummaryCard
          icon={<CircleDollarSign size={20} />}
          label={t.finance.cashWon}
          value={cashFmt(cashSummary.balances.KRW, 'KRW')}
          tone={cashSummary.balances.KRW >= 0 ? 'good' : 'danger'}
          sub={t.finance.cumulative}
        />
        <SummaryCard
          icon={<JapaneseYen size={20} />}
          label={t.finance.cashYen}
          value={cashFmt(cashSummary.balances.JPY, 'JPY')}
          tone={cashSummary.balances.JPY >= 0 ? 'good' : 'danger'}
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

      <section className="insight-grid">
        <div className="settlement-panel" aria-label={t.dashboard.settlementStatus}>
          <div className="settlement-head">
            <span>{t.dashboard.settlementStatus}</span>
            <strong>{fmt(settlement.netWorth)}</strong>
          </div>
          <div className="settlement-metrics">
            <Metric label={t.dashboard.canRepayNow} value={fmt(settlement.repayable)} />
            <Metric label={t.dashboard.canWithdrawNow} value={fmt(settlement.withdrawable)} />
            <Metric label={t.dashboard.afterRepayDebt} value={fmt(settlement.remainingDebt)} />
          </div>
          <SettlementBar
            title={t.dashboard.claimBar}
            total={Math.max(settlement.claim, 1)}
            segments={[
              { label: t.dashboard.repayablePart, value: settlement.repayable, className: 'danger' },
              { label: t.dashboard.withdrawablePart, value: settlement.withdrawable, className: 'good' },
            ]}
            fmt={fmt}
          />
          <SettlementBar
            title={t.dashboard.debtBar}
            total={Math.max(settlement.debt, 1)}
            segments={[
              { label: t.dashboard.repayablePart, value: settlement.repayable, className: 'accent' },
              { label: t.dashboard.remainingDebtPart, value: settlement.remainingDebt, className: 'danger' },
            ]}
            fmt={fmt}
          />
        </div>

        <div className="chart-block">
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
        </div>
      </section>

      <section className="records-panel">
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
      </section>
    </div>
  )
}

function SettlementBar({
  title, total, segments, fmt,
}: {
  title: string
  total: number
  segments: Array<{ label: string; value: number; className: 'good' | 'danger' | 'accent' }>
  fmt: (value: number) => string
}) {
  return (
    <div className="settlement-bar">
      <div className="settlement-bar-title">
        <span>{title}</span>
        <strong>{fmt(segments.reduce((sum, segment) => sum + segment.value, 0))}</strong>
      </div>
      <div className="settlement-bar-track" aria-hidden="true">
        {segments.map(segment => (
          <div
            key={segment.label}
            className={`settlement-bar-segment ${segment.className}`}
            style={{ width: `${Math.max(0, (segment.value / total) * 100)}%` }}
          />
        ))}
      </div>
      <div className="settlement-bar-legend">
        {segments.map(segment => (
          <span key={segment.label} className={`settlement-legend-item ${segment.className}`}>
            {segment.label} <strong>{fmt(segment.value)}</strong>
          </span>
        ))}
      </div>
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
