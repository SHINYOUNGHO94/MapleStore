import { Trash2 } from 'lucide-react'
import { formatCash, formatLostArkGold, formatNumber } from '../lib/format'
import type { T } from '../lib/i18n'
import type { CashEntry, LostArkEntry } from '../types'

type CashProps = {
  kind: 'cash'
  t: T
  entry: CashEntry
  onDelete: (id: string) => void
}

type LostArkProps = {
  kind: 'lostark'
  t: T
  entry: LostArkEntry
  onDelete: (id: string) => void
}

type Props = CashProps | LostArkProps

export default function FinanceEntryRow(props: Props) {
  if (props.kind === 'cash') {
    const { t, entry, onDelete } = props
    const tone = entry.direction === 'deposit' ? 'income' : 'cost'
    const sign = entry.direction === 'deposit' ? '+' : '-'
    const gameLabel = entry.game === 'maple' ? 'Maple' : 'LostArk'
    const directionLabel = entry.direction === 'deposit' ? t.finance.deposit : t.finance.withdraw
    const cashLabel = { KRW: t.finance.won, JPY: t.finance.yen }

    return (
      <article className="entry-item finance-entry-item">
        <div className="entry-main">
          <span className={`entry-badge ${tone}`}>{gameLabel} {t.finance.cashBadge} {directionLabel}</span>
          <strong>{sign}{formatCash(entry.amount_cash, entry.currency, cashLabel)}</strong>
          <p>{entry.occurred_on} · {entry.currency}</p>
          {entry.memo && <p className="memo">{entry.memo}</p>}
        </div>
        <DeleteButton title={t.finance.delete} id={entry.id} onDelete={onDelete} />
      </article>
    )
  }

  const { t, entry, onDelete } = props
  const tone = entry.direction === 'deposit' ? 'income' : 'cost'
  const sign = entry.direction === 'deposit' ? '+' : '-'
  const directionLabel = entry.direction === 'deposit' ? t.finance.deposit : t.finance.withdraw
  const goldFmt = (value: number) => formatLostArkGold(value, t.finance.goldUnit)

  return (
    <article className="entry-item finance-entry-item">
      <div className="entry-main">
        <span className={`entry-badge ${tone}`}>LostArk {directionLabel}</span>
        <strong>{sign}{goldFmt(entry.net_gold)}</strong>
        <p>
          {entry.occurred_on}
          {entry.direction === 'deposit' && entry.fee_applied ? ` · ${t.finance.fee} ${formatNumber(entry.gross_gold - entry.net_gold)}${t.finance.goldUnit}` : ''}
        </p>
        {entry.memo && <p className="memo">{entry.memo}</p>}
      </div>
      <DeleteButton title={t.finance.delete} id={entry.id} onDelete={onDelete} />
    </article>
  )
}

function DeleteButton({ title, id, onDelete }: { title: string; id: string; onDelete: (id: string) => void }) {
  return (
    <div className="entry-actions">
      <button className="icon-button danger" type="button" onClick={() => onDelete(id)} title={title}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}
