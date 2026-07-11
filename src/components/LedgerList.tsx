import { useMemo, useState, type CSSProperties } from 'react'
import { ENTRY_METAS } from '../lib/entryMeta'
import { groupLedgerByPeriod, type LedgerPeriodGroup } from '../lib/calculations'
import {
  groupCashByPeriod,
  groupLostArkByPeriod,
  type CashGameFilter,
  type CashOwnerFilter,
  type CashPeriodGroup,
  type FinancePeriod,
  type LostArkPeriodGroup,
} from '../lib/financeCalculations'
import { formatCash, formatLostArkGold } from '../lib/format'
import { formatMesoT, type T } from '../lib/i18n'
import type { Account, CashEntry, EntryType, LedgerEntry, LostArkEntry, MapleServerFilter, ServerTransfer } from '../types'
import { EntryRow } from './EntryRow'
import FinanceEntryRow from './FinanceEntryRow'
import { getMapleServerLabel, MAPLE_SERVERS } from '../lib/mapleServers'

type LedgerScope = 'maple' | 'transfer' | 'cash' | 'lostark'

type Props = {
  t: T
  entries: LedgerEntry[]
  cashEntries: CashEntry[]
  lostArkEntries: LostArkEntry[]
  transferEntries: ServerTransfer[]
  accounts: Account[]
  loading: boolean
  cashLoading: boolean
  lostArkLoading: boolean
  resetDay: number
  serverFilter: MapleServerFilter
  onServerFilterChange: (server: MapleServerFilter) => void
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
  transferEntries,
  accounts,
  loading,
  cashLoading,
  lostArkLoading,
  resetDay,
  serverFilter,
  onServerFilterChange,
  onEdit,
  onDelete,
  onDeleteCash,
  onDeleteLostArk,
}: Props) {
  const [scope, setScope] = useState<LedgerScope>('maple')
  const [financePeriod, setFinancePeriod] = useState<FinancePeriod>('week')
  const [cashOwnerFilter, setCashOwnerFilter] = useState<CashOwnerFilter>('all')
  const [cashGameFilter, setCashGameFilter] = useState<CashGameFilter>('all')
  const [filter, setFilter] = useState<EntryType | 'all'>('all')
  const accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))

  const filteredEntries = useMemo(
    () => entries.filter(entry => {
      const typeMatches = filter === 'all' || entry.entry_type === filter
      const serverMatches = serverFilter === 'all' || entry.server === serverFilter
      return typeMatches && serverMatches
    }),
    [entries, filter, serverFilter],
  )
  const filteredTransferEntries = useMemo(
    () => transferEntries.filter(entry => (
      serverFilter === 'all' || entry.from_server === serverFilter || entry.to_server === serverFilter
    )),
    [transferEntries, serverFilter],
  )
  const mapleGroups = useMemo(
    () => groupLedgerByPeriod(filteredEntries, financePeriod, resetDay),
    [filteredEntries, financePeriod, resetDay],
  )
  const filteredCashEntries = useMemo(
    () => cashEntries.filter(entry => {
      const ownerMatches = cashOwnerFilter === 'all' || entry.owner === cashOwnerFilter
      const gameMatches = cashGameFilter === 'all' || entry.game === cashGameFilter
      return ownerMatches && gameMatches
    }),
    [cashEntries, cashOwnerFilter, cashGameFilter],
  )
  const cashGroups = useMemo(
    () => groupCashByPeriod(filteredCashEntries, financePeriod, resetDay),
    [filteredCashEntries, financePeriod, resetDay],
  )
  const lostArkGroups = useMemo(
    () => groupLostArkByPeriod(lostArkEntries, financePeriod, resetDay),
    [lostArkEntries, financePeriod, resetDay],
  )
  const count = scope === 'cash'
    ? filteredCashEntries.length
    : scope === 'lostark'
      ? lostArkEntries.length
      : scope === 'transfer'
        ? filteredTransferEntries.length
      : filteredEntries.length

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
        <button className={scope === 'transfer' ? 'selected' : ''} type="button" onClick={() => setScope('transfer')}>
          {t.server.transferLedger}
        </button>
        <button className={scope === 'cash' ? 'selected' : ''} type="button" onClick={() => setScope('cash')}>
          {t.finance.cashLedger}
        </button>
        <button className={scope === 'lostark' ? 'selected' : ''} type="button" onClick={() => setScope('lostark')}>
          {t.finance.lostArkLedger}
        </button>
      </div>

      {(scope === 'maple' || scope === 'transfer') && (
        <ServerFilterTabs t={t} serverFilter={serverFilter} onChange={onServerFilterChange} />
      )}

      {scope === 'cash' && (
        <>
          <FinancePeriodTabs t={t} period={financePeriod} onChange={setFinancePeriod} />
          <CashFilterTabs
            t={t}
            owner={cashOwnerFilter}
            game={cashGameFilter}
            onOwnerChange={setCashOwnerFilter}
            onGameChange={setCashGameFilter}
          />
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

      {scope === 'transfer' && (
        <TransferFinanceLedger
          t={t}
          loading={false}
          emptyText={t.server.noRecord}
          entries={filteredTransferEntries}
        />
      )}

      {scope === 'maple' && (
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
          <FinancePeriodTabs t={t} period={financePeriod} onChange={setFinancePeriod} />
          <MapleFinanceLedger
            t={t}
            period={financePeriod}
            loading={loading}
            groups={mapleGroups}
            accountNames={accountNames}
            onEdit={onEdit}
            onDelete={onDelete}
          />
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

function ServerFilterTabs({
  t, serverFilter, onChange,
}: {
  t: T
  serverFilter: MapleServerFilter
  onChange: (server: MapleServerFilter) => void
}) {
  return (
    <div className="segmented-control finance-period-tabs">
      <button className={serverFilter === 'all' ? 'selected' : ''} type="button" onClick={() => onChange('all')}>
        {getMapleServerLabel(t, 'all')}
      </button>
      {MAPLE_SERVERS.map(server => (
        <button key={server} className={serverFilter === server ? 'selected' : ''} type="button" onClick={() => onChange(server)}>
          {getMapleServerLabel(t, server)}
        </button>
      ))}
    </div>
  )
}

function CashFilterTabs({
  t, owner, game, onOwnerChange, onGameChange,
}: {
  t: T
  owner: CashOwnerFilter
  game: CashGameFilter
  onOwnerChange: (owner: CashOwnerFilter) => void
  onGameChange: (game: CashGameFilter) => void
}) {
  const ownerItems: Array<{ id: CashOwnerFilter; label: string }> = [
    { id: 'all', label: t.finance.ownerAll },
    { id: 'aya', label: t.finance.ownerAya },
    { id: 'oppa', label: t.finance.ownerOppa },
  ]
  const gameItems: Array<{ id: CashGameFilter; label: string }> = [
    { id: 'all', label: t.finance.gameAll },
    { id: 'maple', label: 'Maple' },
    { id: 'lostark', label: 'LostArk' },
  ]

  return (
    <div className="cash-ledger-filter-grid">
      <div className="segmented-control finance-period-tabs">
        {ownerItems.map(item => (
          <button key={item.id} className={owner === item.id ? 'selected' : ''} type="button" onClick={() => onOwnerChange(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="segmented-control finance-period-tabs">
        {gameItems.map(item => (
          <button key={item.id} className={game === item.id ? 'selected' : ''} type="button" onClick={() => onGameChange(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TransferFinanceLedger({
  t, loading, emptyText, entries,
}: {
  t: T
  loading: boolean
  emptyText: string
  entries: ServerTransfer[]
}) {
  if (loading) return <div className="empty-state">{t.finance.loading}</div>
  if (entries.length === 0) return <div className="empty-state mascot-empty">{emptyText}</div>

  const mesoFmt = (value: number) => formatMesoT(value, t.units)
  const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.amount_meso || 0), 0)
  const totalReceived = entries.reduce((sum, entry) => sum + Number(entry.received_meso || 0), 0)
  const totalOppaAmount = entries.reduce((sum, entry) => sum + Number(entry.oppa_amount_meso || 0), 0)
  const totalOppaReceived = entries.reduce((sum, entry) => sum + Number(entry.oppa_received_meso || 0), 0)

  return (
    <div className="finance-period-list">
      <article className="finance-period-card">
        <div className="finance-period-head">
          <div>
            <span>{t.server.transferLedger}</span>
            <strong>{t.finance.periodAll}</strong>
          </div>
          <span className="count-pill">{entries.length}{t.misc.records}</span>
        </div>
        <div className="finance-period-metrics">
          <PeriodMetric label={t.server.amount} value={mesoFmt(totalAmount)} />
          <PeriodMetric label={t.server.received} value={mesoFmt(totalReceived)} />
          <PeriodMetric label={t.server.oppaAmount} value={mesoFmt(totalOppaAmount)} />
          <PeriodMetric label={t.server.oppaReceived} value={mesoFmt(totalOppaReceived)} />
        </div>
        <div className="entry-list finance-period-entries">
          {entries.map(entry => (
            <article key={entry.id} className="entry-item finance-entry-item">
              <div className="entry-main">
                <span className="entry-badge neutral">
                  {getMapleServerLabel(t, entry.from_server)} → {getMapleServerLabel(t, entry.to_server)}
                </span>
                <strong>{mesoFmt(entry.oppa_received_meso)}</strong>
                <p>{entry.occurred_on} · {t.server.amount} {mesoFmt(entry.amount_meso)} · {t.server.oppaAmount} {mesoFmt(entry.oppa_amount_meso)}</p>
                <p>{t.server.fee} {mesoFmt(entry.fee_meso)} · {t.server.oppaReceived} {mesoFmt(entry.oppa_received_meso)}</p>
                {entry.memo && <p className="memo">{entry.memo}</p>}
              </div>
            </article>
          ))}
        </div>
      </article>
    </div>
  )
}

function MapleFinanceLedger({
  t, period, loading, groups, accountNames, onEdit, onDelete,
}: {
  t: T
  period: FinancePeriod
  loading: boolean
  groups: LedgerPeriodGroup[]
  accountNames: Record<string, string>
  onEdit: (entry: LedgerEntry) => void
  onDelete: (id: string) => void
}) {
  if (loading) return <div className="empty-state">{t.dashboard.loading}</div>
  if (groups.length === 0) return <div className="empty-state mascot-empty">{t.ledger.noRecord}</div>

  const mesoFmt = (value: number) => formatMesoT(value, t.units)

  return (
    <div className="finance-period-list">
      <PeriodColumnChart
        title={t.finance.goldFlow}
        bars={groups.map(group => ({
          label: period === 'all' ? t.finance.periodAll : group.label,
          value: group.net,
          className: group.net >= 0 ? 'good' : 'danger',
        }))}
        fmt={mesoFmt}
      />

      {groups.map(group => (
        <article key={group.key} className="finance-period-card">
          <PeriodHeader t={t} period={period} label={group.label} count={group.entries.length} />
          <div className="finance-period-metrics">
            <PeriodMetric label={t.dashboard.bossTotal} value={mesoFmt(group.bossIncome)} />
            <PeriodMetric label={t.dashboard.bossCostTotal} value={mesoFmt(group.bossCost)} />
            <PeriodMetric label={t.finance.periodNet} value={mesoFmt(group.net)} />
          </div>
          <div className="entry-list finance-period-entries">
            {group.entries.map(entry => (
              <EntryRow key={entry.id} t={t} entry={entry} accountNames={accountNames} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </article>
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
  const cashPairFmt = (values: Record<'KRW' | 'JPY', number>) => `${cashFmt(values.KRW, 'KRW')} · ${cashFmt(values.JPY, 'JPY')}`

  return (
    <div className="finance-period-list">
      <div className="period-chart-grid">
        <PeriodColumnChart
          title={t.finance.krwFlow}
          bars={groups.map(group => ({
            label: period === 'all' ? t.finance.periodAll : group.label,
            value: group.balances.KRW,
            className: group.balances.KRW >= 0 ? 'good' : 'danger',
          }))}
          fmt={value => cashFmt(value, 'KRW')}
        />
        <PeriodColumnChart
          title={t.finance.jpyFlow}
          bars={groups.map(group => ({
            label: period === 'all' ? t.finance.periodAll : group.label,
            value: group.balances.JPY,
            className: group.balances.JPY >= 0 ? 'good' : 'danger',
          }))}
          fmt={value => cashFmt(value, 'JPY')}
        />
      </div>

      {groups.map(group => (
        <article key={group.key} className="finance-period-card">
          <PeriodHeader t={t} period={period} label={group.label} count={group.entries.length} />
          <div className="finance-period-metrics">
            <PeriodMetric label={t.finance.periodNet} value={cashPairFmt(group.balances)} />
            <PeriodMetric label={t.finance.depositTotal} value={cashPairFmt(group.deposits)} />
            <PeriodMetric label={t.finance.withdrawalTotal} value={cashPairFmt(group.withdrawals)} />
            <PeriodMetric label={t.finance.mapleIncome} value={cashPairFmt(group.gameDeposits.maple)} />
            <PeriodMetric label={t.finance.lostArkIncome} value={cashPairFmt(group.gameDeposits.lostark)} />
          </div>
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
      <PeriodColumnChart
        title={t.finance.goldFlow}
        bars={groups.map(group => ({
          label: period === 'all' ? t.finance.periodAll : group.label,
          value: group.balanceGold,
          className: group.balanceGold >= 0 ? 'good' : 'danger',
        }))}
        fmt={goldFmt}
      />

      {groups.map(group => (
        <article key={group.key} className="finance-period-card">
          <PeriodHeader t={t} period={period} label={group.label} count={group.entries.length} />
          <div className="finance-period-metrics">
            <PeriodMetric label={t.finance.periodNet} value={goldFmt(group.balanceGold)} />
            <PeriodMetric label={t.finance.depositTotal} value={goldFmt(group.depositGold)} />
            <PeriodMetric label={t.finance.withdrawalTotal} value={goldFmt(group.withdrawalGold)} />
            <PeriodMetric label={t.finance.feeTotal} value={goldFmt(group.feeGold)} />
          </div>
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

type PeriodChartBar = {
  label: string
  value: number
  className: 'good' | 'danger' | 'accent'
}

function PeriodColumnChart({
  title, bars, fmt,
}: {
  title: string
  bars: PeriodChartBar[]
  fmt: (value: number) => string
}) {
  const orderedBars = [...bars].reverse()
  const total = bars.reduce((sum, bar) => sum + bar.value, 0)
  const maxValue = Math.max(1, ...bars.map(bar => Math.abs(bar.value)))
  const ticks = buildChartTicks(maxValue)
  const scaleMax = ticks[0] || maxValue
  const chartRows = { '--chart-rows': ticks.length } as CSSProperties

  return (
    <div className="period-column-chart" style={chartRows}>
      <div className="period-column-head">
        <span>{title}</span>
        <strong>{fmt(total)}</strong>
      </div>
      <div className="period-column-body">
        <div className="period-column-axis" aria-hidden="true">
          {ticks.map(tick => <span key={tick}>{fmt(tick)}</span>)}
        </div>
        <div className="period-column-plot">
          <div className="period-column-grid" aria-hidden="true">
            {ticks.map(tick => <span key={tick} />)}
          </div>
          <div className="period-column-bars">
            {orderedBars.map(bar => {
              const height = bar.value === 0 ? 0 : Math.max(4, (Math.abs(bar.value) / scaleMax) * 100)
              return (
                <div key={bar.label} className="period-column" title={`${bar.label} ${fmt(bar.value)}`}>
                  <div className="period-column-value">{fmt(bar.value)}</div>
                  <div className="period-column-fillbox">
                    <span
                      className={`period-column-fill ${bar.className}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="period-column-label">{bar.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function buildChartTicks(maxValue: number) {
  const roughStep = Math.max(1, maxValue / 5)
  const step = niceChartStep(roughStep)
  const top = Math.max(step, Math.ceil(maxValue / step) * step)
  const ticks: number[] = []
  for (let tick = top; tick >= 0; tick -= step) ticks.push(tick)
  if (ticks[ticks.length - 1] !== 0) ticks.push(0)
  return ticks
}

function niceChartStep(value: number) {
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const ratio = value / magnitude
  const niceRatio = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10
  return niceRatio * magnitude
}
