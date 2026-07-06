import { Trash2 } from 'lucide-react'
import { formatCash, formatLostArkGold, formatNumber } from '../lib/format'
import type { CashEntry, LostArkEntry } from '../types'

type CashProps = {
  kind: 'cash'
  entry: CashEntry
  onDelete: (id: string) => void
}

type LostArkProps = {
  kind: 'lostark'
  entry: LostArkEntry
  onDelete: (id: string) => void
}

type Props = CashProps | LostArkProps

export default function FinanceEntryRow(props: Props) {
  if (props.kind === 'cash') {
    const { entry, onDelete } = props
    const tone = entry.direction === 'deposit' ? 'income' : 'cost'
    const sign = entry.direction === 'deposit' ? '+' : '-'
    const gameLabel = entry.game === 'maple' ? 'Maple' : 'LostArk'

    return (
      <article className="entry-item finance-entry-item">
        <div className="entry-main">
          <span className={`entry-badge ${tone}`}>{gameLabel} 현금 {entry.direction === 'deposit' ? '입금' : '출금'}</span>
          <strong>{sign}{formatCash(entry.amount_cash, entry.currency)}</strong>
          <p>{entry.occurred_on} · {entry.currency}</p>
          {entry.memo && <p className="memo">{entry.memo}</p>}
        </div>
        <DeleteButton id={entry.id} onDelete={onDelete} />
      </article>
    )
  }

  const { entry, onDelete } = props
  const tone = entry.direction === 'deposit' ? 'income' : 'cost'
  const sign = entry.direction === 'deposit' ? '+' : '-'

  return (
    <article className="entry-item finance-entry-item">
      <div className="entry-main">
        <span className={`entry-badge ${tone}`}>LostArk {entry.direction === 'deposit' ? '입금' : '출금'}</span>
        <strong>{sign}{formatLostArkGold(entry.net_gold)}</strong>
        <p>
          {entry.occurred_on}
          {entry.direction === 'deposit' && entry.fee_applied ? ` · 수수료 ${formatNumber(entry.gross_gold - entry.net_gold)}골드` : ''}
        </p>
        {entry.memo && <p className="memo">{entry.memo}</p>}
      </div>
      <DeleteButton id={entry.id} onDelete={onDelete} />
    </article>
  )
}

function DeleteButton({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <div className="entry-actions">
      <button className="icon-button danger" type="button" onClick={() => onDelete(id)} title="삭제">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
