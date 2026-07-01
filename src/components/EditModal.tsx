import EntryForm from './EntryForm'
import type { T } from '../lib/i18n'
import type { Account, LedgerEntry, LedgerEntryDraft } from '../types'

type Props = {
  t: T
  entry: LedgerEntry
  accounts: Account[]
  saving: boolean
  onSave: (draft: LedgerEntryDraft) => Promise<void>
  onClose: () => void
}

export default function EditModal({ t, entry, accounts, saving, onSave, onClose }: Props) {
  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-card">
        <EntryForm
          t={t}
          accounts={accounts}
          initialEntry={entry}
          saving={saving}
          onSave={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
