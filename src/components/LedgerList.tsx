import { useMemo, useState } from 'react'
import { ENTRY_METAS } from '../lib/entryMeta'
import { groupByWeek } from '../lib/calculations'
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
  const [filter, setFilter] = useState<EntryType | 'all'>('all')
  const accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))

  const filteredEntries = useMemo(
    () => filter === 'all' ? entries : entries.filter(e => e.entry_type === filter),
    [entries, filter],
  )

  const weeks = useMemo(() => groupByWeek(entries, resetDay), [entries, resetDay])
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
          메이플 장부
        </button>
        <button className={scope === 'cash' ? 'selected' : ''} type="button" onClick={() => setScope('cash')}>
          현금 장부
        </button>
        <button className={scope === 'lostark' ? 'selected' : ''} type="button" onClick={() => setScope('lostark')}>
          LostArk 장부
        </button>
      </div>

      {scope === 'cash' && (
        <FinanceLedger
          loading={cashLoading}
          emptyText="현금 기록이 없습니다."
          entries={cashEntries.map(entry => (
            <FinanceEntryRow key={entry.id} kind="cash" entry={entry} onDelete={onDeleteCash} />
          ))}
        />
      )}

      {scope === 'lostark' && (
        <FinanceLedger
          loading={lostArkLoading}
          emptyText="LostArk 기록이 없습니다."
          entries={lostArkEntries.map(entry => (
            <FinanceEntryRow key={entry.id} kind="lostark" entry={entry} onDelete={onDeleteLostArk} />
          ))}
        />
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

function FinanceLedger({
  loading, emptyText, entries,
}: {
  loading: boolean
  emptyText: string
  entries: React.ReactNode[]
}) {
  if (loading) return <div className="empty-state">불러오는 중</div>
  if (entries.length === 0) return <div className="empty-state mascot-empty">{emptyText}</div>
  return <div className="entry-list">{entries}</div>
}
