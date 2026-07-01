import { useMemo, useState } from 'react'
import { ENTRY_METAS } from '../lib/entryMeta'
import { groupByWeek } from '../lib/calculations'
import type { T } from '../lib/i18n'
import type { Account, LedgerEntry, EntryType } from '../types'
import { EntryRow } from './EntryRow'
import WeeklyHistory from './WeeklyHistory'

type View = 'all' | 'weekly'

type Props = {
  t: T
  entries: LedgerEntry[]
  accounts: Account[]
  loading: boolean
  resetDay: number
  onEdit: (entry: LedgerEntry) => void
  onDelete: (id: string) => void
}

export default function LedgerList({ t, entries, accounts, loading, resetDay, onEdit, onDelete }: Props) {
  const [view, setView] = useState<View>('all')
  const [filter, setFilter] = useState<EntryType | 'all'>('all')
  const accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))

  const filteredEntries = useMemo(
    () => filter === 'all' ? entries : entries.filter(e => e.entry_type === filter),
    [entries, filter],
  )

  const weeks = useMemo(() => groupByWeek(entries, resetDay), [entries, resetDay])
  const count = view === 'all' ? filteredEntries.length : entries.length

  return (
    <div className="screen-stack">
      <div className="section-heading">
        <h2>{t.ledger.title}</h2>
        <span className="count-pill">{count}{t.misc.records}</span>
      </div>

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
    </div>
  )
}
