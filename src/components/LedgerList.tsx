import { useMemo, useState } from 'react'
import { ENTRY_METAS } from '../lib/entryMeta'
import { groupByWeek } from '../lib/calculations'
import {
  groupCashByPeriod,
  groupLostArkByPeriod,
  type CashPeriodGroup,
  type FinancePeriod,
  type LostArkPeriodGroup,
} from '../lib/financeCalculations'
import { formatCash, formatLostArkGold } from '../lib/format'
import type { T } from '../lib/i18n'
import type { Account, CashEntry, LedgerEntry, EntryType, LostArkEntry } from '../types'
import { EntryRow } from './EntryRow'
import FinanceEntryRow from './FinanceEntryRow'
import WeeklyHistory from './WeeklyHistory'

type View = 'all' | 'weekly'
type LedgerScope = 'maple' | 'cash' | 'lostark'

type Props = {
  t: T
  entries: LedgerEntry[]
  cashEntries: CashEntry[]
  lostArkEntries: LostArkEntry[]
  accounts: Account[]
  loading: boolean
  cashLoading: boolean
  lostArkLoading: boolean
  resetDay: number
  onEdit: (entry: LedgerEntry) => void
  onDelete: (id: string) => void
  onDeleteCash: (id: string) => void
  onDeleteLostArk: (id: string) => void
}

export default function LedgerList({
  t,
  entries,
  cashEntries,
  lostArkEntries,
  accounts,
  loading,
  cashLoading,
  lostArkLoading,
  resetDay,
  onEdit,
  onDelete,
  onDeleteCash,
  onDeleteLostArk,
}: Props) {
  const [scope, setScope] = useState<LedgerScope>('maple')
  const [view, setView] = useState<View>('all')
  const [financePeriod, setFinancePeriod] = useState<FinancePeriod>('week')
  const [filter, setFilter] = useState<EntryType | 'all'>('all')
  const accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))

  const filteredEntries = useMemo(
    () => filter === 'all' ? entries : entries.filter(e => e.entry_type === filter),
    [entries, filter],
  )

  const weeks = useMemo(() => groupByWeek(entries, resetDay), [entries, resetDay])
  const cashGroups = useMemo(
    () => groupCashByPeriod(cashEntries, financePeriod, resetDay),
    [cashEntries, financePeriod, resetDay],
  )
  const lostArkGroups = useMemo(
    () => groupLostArkByPeriod(lostArkEntries, financePeriod, resetDay),
    [lostArkEntries, financePeriod, resetDay],
  )
  const count = scope === 'cash'
    ? cashEntries.length
    : scope === 'lostark'
      ? lostArkEntries.length
      : view === 'all'
        ? filteredEntries.length
        : entries.length

  return (
    <div className="screen-stack">
      <div className="section-heading">
        <h2>{t.ledger.title}</h2>
        <span className="count-pill">{count}{t.misc.records}</span>
      </div>

      <div className="segmented-control ledger-scope-tabs">
        <button className={scope === 'maple' ? 'selected' : ''} type="button" onClick={() => setScope('maple')}>
          {t.finance.mapleLedger}
        </button>
        <button className={scope === 'cash' ? 'selected' : ''} type="button" onClick={() => setScope('cash')}>
          {t.finance.cashLedger}
        </button>
        <button className={scope === 'lostark' ? 'selected' : ''} type="button" onClick={() => setScope('lostark')}>
          {t.finance.lostArkLedger}
        </button>
      </div>

      {scope === 'cash' && (
        <>
          <FinancePeriodTabs t={t} period={financePeriod} onChange={setFinancePeriod} />
          <CashFinanceLedger
            t={t}
            period={financePeriod}
            loading={cashLoading}
            emptyText={t.finance.noCashLedger}
            groups={cashGroups}
            onDelete={onDeleteCash}
          />
        </>
      )}

      {scope === 'lostark' && (
        <>
          <FinancePeriodTabs t={t} period={financePeriod} onChange={setFinancePeriod} />
          <LostArkFinanceLedger
            t={t}
            period={financePeriod}
            loading={lostArkLoading}
            emptyText={t.finance.noLostArkLedger}
            groups={lostArkGroups}
            onDelete={onDeleteLostArk}
          />
        </>
      )}

      {scope === 'maple' && (
        <>
      <div className="segmented-control">
        <button className={view === 'all' ? 'selected' : ''} type="button" onClick={() => setView('all')}>
          {t.ledger.allView}
        </button>
        <button className={view === 'weekly' ? 'selected' : ''} type="button" onClick={() => setView('weekly')}>
          {t.ledger.weeklyView}
        </button>
      </div>

      {view === 'all' && (
        <>
          <div className="filter-row">
            <button className={filter === 'all' ? 'selected' : ''} type="button" onClick={() => setFilter('all')}>
              {t.ledger.filterAll}
            </button>
            {ENTRY_METAS.map(meta => (
              <button
                key={meta.value}
                className={filter === meta.value ? 'selected' : ''}
                type="button"
                onClick={() => setFilter(meta.value)}
              >
                {t.entryTypes[meta.value] ?? meta.value}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">{t.dashboard.loading}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">{t.ledger.noRecord}</div>
          ) : (
            <div className="entry-list">
              {filteredEntries.map(entry => (
                <EntryRow key={entry.id} t={t} entry={entry} accountNames={accountNames} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'weekly' && (
        <WeeklyHistory t={t} weeks={weeks} accountNames={accountNames} loading={loading} onEdit={onEdit} onDelete={onDelete} />
      )}
        </>
      )}
    </div>
  )
}

function FinancePeriodTabs({
  t, period, onChange,
}: {
  t: T
  period: FinancePeriod
  onChange: (period: FinancePeriod) => void
}) {
  const items: Array<{ id: FinancePeriod; label: string }> = [
    { id: 'all', label: t.finance.periodAll },
    { id: 'week', label: t.finance.periodWeek },
    { id: 'month', label: t.finance.periodMonth },
    { id: 'year', label: t.finance.periodYear },
  ]

  return (
    <div className="segmented-control finance-period-tabs">
      {items.map(item => (
        <button key={item.id} className={period === item.id ? 'selected' : ''} type="button" onClick={() => onChange(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  )
}

function CashFinanceLedger({
  t, period, loading, emptyText, groups, onDelete,
}: {
  t: T
  period: FinancePeriod
  loading: boolean
  emptyText: string
  groups: CashPeriodGroup[]
  onDelete: (id: string) => void
}) {
  if (loading) return <div className="empty-state">{t.finance.loading}</div>
  if (groups.length === 0) return <div className="empty-state mascot-empty">{emptyText}</div>

  const cashFmt = (value: number, currency: 'KRW' | 'JPY') => formatCash(value, currency, { KRW: t.finance.won, JPY: t.finance.yen })

  return (
    <div className="finance-period-list">
      {groups.map(group => (
        <article key={group.key} className="finance-period-card">
          <PeriodHeader t={t} period={period} label={group.label} count={group.entries.length} />
          <div className="finance-period-metrics">
            <PeriodMetric label={`${t.finance.won} ${t.finance.periodNet}`} value={cashFmt(group.balances.KRW, 'KRW')} />
            <PeriodMetric label={`${t.finance.yen} ${t.finance.periodNet}`} value={cashFmt(group.balances.JPY, 'JPY')} />
          </div>
          <PeriodFlowBar
            title={t.finance.krwFlow}
            segments={[
              { label: t.finance.deposit, value: group.deposits.KRW, className: 'good' },
              { label: t.finance.withdraw, value: group.withdrawals.KRW, className: 'danger' },
            ]}
            fmt={value => cashFmt(value, 'KRW')}
          />
          <PeriodFlowBar
            title={t.finance.jpyFlow}
            segments={[
              { label: t.finance.deposit, value: group.deposits.JPY, className: 'good' },
              { label: t.finance.withdraw, value: group.withdrawals.JPY, className: 'danger' },
            ]}
            fmt={value => cashFmt(value, 'JPY')}
          />
          <div className="entry-list finance-period-entries">
            {group.entries.map(entry => (
              <FinanceEntryRow key={entry.id} t={t} kind="cash" entry={entry} onDelete={onDelete} />
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

function LostArkFinanceLedger({
  t, period, loading, emptyText, groups, onDelete,
}: {
  t: T
  period: FinancePeriod
  loading: boolean
  emptyText: string
  groups: LostArkPeriodGroup[]
  onDelete: (id: string) => void
}) {
  if (loading) return <div className="empty-state">{t.finance.loading}</div>
  if (groups.length === 0) return <div className="empty-state mascot-empty">{emptyText}</div>

  const goldFmt = (value: number) => formatLostArkGold(value, t.finance.goldUnit)

  return (
    <div className="finance-period-list">
      {groups.map(group => (
        <article key={group.key} className="finance-period-card">
          <PeriodHeader t={t} period={period} label={group.label} count={group.entries.length} />
          <div className="finance-period-metrics">
            <PeriodMetric label={t.finance.periodNet} value={goldFmt(group.balanceGold)} />
            <PeriodMetric label={t.finance.feeTotal} value={goldFmt(group.feeGold)} />
          </div>
          <PeriodFlowBar
            title={t.finance.goldFlow}
            segments={[
              { label: t.finance.deposit, value: group.depositGold, className: 'good' },
              { label: t.finance.withdraw, value: group.withdrawalGold, className: 'danger' },
              { label: t.finance.fee, value: group.feeGold, className: 'accent' },
            ]}
            fmt={goldFmt}
          />
          <div className="entry-list finance-period-entries">
            {group.entries.map(entry => (
              <FinanceEntryRow key={entry.id} t={t} kind="lostark" entry={entry} onDelete={onDelete} />
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

function PeriodHeader({ t, period, label, count }: { t: T; period: FinancePeriod; label: string; count: number }) {
  const prefix = period === 'all'
    ? t.finance.periodAll
    : period === 'week'
      ? t.finance.periodWeek
      : period === 'month'
        ? t.finance.periodMonth
        : t.finance.periodYear

  return (
    <div className="finance-period-head">
      <div>
        <span>{prefix}</span>
        <strong>{period === 'all' ? t.finance.periodAll : label}</strong>
      </div>
      <span className="count-pill">{count}{t.misc.records}</span>
    </div>
  )
}

function PeriodMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="period-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PeriodFlowBar({
  title, segments, fmt,
}: {
  title: string
  segments: Array<{ label: string; value: number; className: 'good' | 'danger' | 'accent' }>
  fmt: (value: number) => string
}) {
  const total = Math.max(1, segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0))

  return (
    <div className="period-flow-bar">
      <div className="period-flow-title">
        <span>{title}</span>
        <strong>{fmt(segments.reduce((sum, segment) => sum + segment.value, 0))}</strong>
      </div>
      <div className="period-flow-track" aria-hidden="true">
        {segments.map(segment => (
          <div
            key={segment.label}
            className={`period-flow-segment ${segment.className}`}
            style={{ width: `${Math.max(0, (segment.value / total) * 100)}%` }}
          />
        ))}
      </div>
      <div className="period-flow-legend">
        {segments.map(segment => (
          <span key={segment.label} className={`settlement-legend-item ${segment.className}`}>
            {segment.label} <strong>{fmt(segment.value)}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}
