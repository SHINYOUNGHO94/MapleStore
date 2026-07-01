import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatMesoT, type T } from '../lib/i18n'
import type { WeekGroup } from '../lib/calculations'
import type { LedgerEntry } from '../types'
import { EntryRow } from './EntryRow'

type Props = {
  t: T
  weeks: WeekGroup[]
  accountNames: Record<string, string>
  loading: boolean
  onEdit: (entry: LedgerEntry) => void
  onDelete: (id: string) => void
}

export default function WeeklyHistory({ t, weeks, accountNames, loading, onEdit, onDelete }: Props) {
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(() => {
    const first = weeks[0]?.weekStart
    return first ? new Set([first]) : new Set()
  })

  function toggle(weekStart: string) {
    setOpenWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekStart)) next.delete(weekStart)
      else next.add(weekStart)
      return next
    })
  }

  const fmt = (v: number) => formatMesoT(v, t.units)

  if (loading) return <div className="empty-state">{t.dashboard.loading}</div>
  if (weeks.length === 0) return <div className="empty-state">{t.weekly.noRecord}</div>

  return (
    <div className="week-list">
      {weeks.map(week => {
        const open = openWeeks.has(week.weekStart)
        return (
          <div key={week.weekStart} className="week-group">
            <button className="week-header" type="button" onClick={() => toggle(week.weekStart)}>
              <div className="week-header-left">
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="week-label">{week.weekStart} {t.weekly.week}</span>
                <span className="count-pill">{week.entries.length}{t.misc.records}</span>
              </div>
              <div className="week-header-right">
                <span className="week-stat income">{fmt(week.bossIncome)}</span>
                {week.bossCost > 0 && (
                  <span className="week-stat cost">{t.weekly.costPrefix} {fmt(week.bossCost)}</span>
                )}
                <span className={`week-net ${week.net >= 0 ? 'positive' : 'negative'}`}>
                  {week.net >= 0 ? '+' : ''}{fmt(week.net)}
                </span>
              </div>
            </button>
            {open && (
              <div className="week-entries">
                {week.entries.map(entry => (
                  <EntryRow key={entry.id} t={t} entry={entry} accountNames={accountNames} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
