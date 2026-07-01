import { Pencil, Trash2 } from 'lucide-react'
import { getEntryMeta } from '../lib/entryMeta'
import { formatMesoT } from '../lib/i18n'
import type { T } from '../lib/i18n'
import type { LedgerEntry } from '../types'

type Props = {
  t: T
  entry: LedgerEntry
  accountNames: Record<string, string>
  onEdit: (entry: LedgerEntry) => void
  onDelete: (id: string) => void
}

export function EntryRow({ t, entry, accountNames, onEdit, onDelete }: Props) {
  const meta = getEntryMeta(entry.entry_type)
  const label = t.entryTypes[entry.entry_type] ?? entry.entry_type
  const accountName = accountNames[entry.account_id]

  return (
    <article className="entry-item">
      <div className="entry-main">
        <span className={`entry-badge ${meta.tone}`}>{label}</span>
        <strong>{formatMesoT(entry.amount_meso, t.units)}</strong>
        <p>
          {entry.occurred_on}
          {accountName ? ` · ${accountName}` : ''}
          {entry.boss_name ? ` · ${entry.boss_name}` : ''}
        </p>
        {entry.memo && <p className="memo">{entry.memo}</p>}
      </div>
      <div className="entry-actions">
        <button className="icon-button" type="button" onClick={() => onEdit(entry)} title={t.form.editTitle}>
          <Pencil size={16} />
        </button>
        <button className="icon-button danger" type="button" onClick={() => onDelete(entry.id)} title={t.toast.deleted}>
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}
