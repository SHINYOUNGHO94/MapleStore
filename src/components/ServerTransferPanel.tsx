import { useMemo, useState } from 'react'
import { ArrowRightLeft, Plus, Trash2 } from 'lucide-react'
import { todayInputValue } from '../lib/calculations'
import { formatMesoT, type T } from '../lib/i18n'
import { getMapleServerLabel, MAPLE_SERVERS } from '../lib/mapleServers'
import { floorToMan, toMeso } from '../lib/units'
import type { MapleServer, ServerTransfer, ServerTransferDraft } from '../types'
import GoldAmountFields from './GoldAmountFields'

type Props = {
  t: T
  entries: ServerTransfer[]
  loading: boolean
  saving: boolean
  onSave: (draft: ServerTransferDraft) => Promise<void> | void
  onDelete: (id: string) => void
}

export default function ServerTransferPanel({ t, entries, loading, saving, onSave, onDelete }: Props) {
  const [occurredOn, setOccurredOn] = useState(todayInputValue())
  const [fromServer, setFromServer] = useState<MapleServer>('scania')
  const [toServer, setToServer] = useState<MapleServer>('challengers')
  const [amountEok, setAmountEok] = useState('')
  const [amountMan, setAmountMan] = useState('')
  const [oppaAmountEok, setOppaAmountEok] = useState('')
  const [oppaAmountMan, setOppaAmountMan] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const amount = toMeso(amountEok, amountMan)
  const rawOppaAmount = toMeso(oppaAmountEok, oppaAmountMan)
  const oppaAmount = rawOppaAmount > 0 ? rawOppaAmount : amount
  const fee = floorToMan(amount * 0.01)
  const received = Math.max(0, amount - fee)
  const oppaFee = floorToMan(oppaAmount * 0.01)
  const oppaReceived = Math.max(0, oppaAmount - oppaFee)
  const fmt = (value: number) => formatMesoT(value, t.units)
  const recentEntries = entries.slice(0, 10)

  const totals = useMemo(() => entries.reduce((acc, entry) => {
    acc.amount += Number(entry.amount_meso) || 0
    acc.fee += Number(entry.fee_meso) || 0
    acc.received += Number(entry.received_meso) || 0
    acc.oppaAmount += Number(entry.oppa_amount_meso) || 0
    acc.oppaFee += Number(entry.oppa_fee_meso) || 0
    acc.oppaReceived += Number(entry.oppa_received_meso) || 0
    return acc
  }, { amount: 0, fee: 0, received: 0, oppaAmount: 0, oppaFee: 0, oppaReceived: 0 }), [entries])

  function flipServers() {
    setFromServer(toServer)
    setToServer(fromServer)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (fromServer === toServer) {
      setError(t.server.sameError)
      return
    }
    if (amount <= 0) {
      setError(t.server.amountError)
      return
    }
    if (oppaAmount > amount) {
      setError(t.server.oppaAmountError)
      return
    }

    setError('')
    await onSave({
      occurred_on: occurredOn,
      from_server: fromServer,
      to_server: toServer,
      amount_meso: amount,
      fee_meso: fee,
      received_meso: received,
      oppa_amount_meso: oppaAmount,
      oppa_fee_meso: oppaFee,
      oppa_received_meso: oppaReceived,
      memo: memo.trim() || null,
    })
    setAmountEok('')
    setAmountMan('')
    setOppaAmountEok('')
    setOppaAmountMan('')
    setMemo('')
  }

  return (
    <div className="screen-stack transfer-screen">
      <section className="finance-hero transfer-hero">
        <div>
          <p className="eyebrow">Server Transfer</p>
          <h2>{t.server.title}</h2>
          <p>{t.server.desc}</p>
        </div>
        <div className="finance-hero-mark">
          <ArrowRightLeft size={34} />
        </div>
      </section>

      <section className="summary-grid finance-summary-grid">
        <SummaryCard label={t.server.amount} value={fmt(totals.amount)} />
        <SummaryCard label={t.server.oppaAmount} value={fmt(totals.oppaAmount)} />
        <SummaryCard label={t.server.oppaReceived} value={fmt(totals.oppaReceived)} />
        <SummaryCard label={t.server.feeRate} value="1%" />
      </section>

      <section className="finance-grid">
        <form className="entry-form finance-form" onSubmit={event => void submit(event)}>
          <div className="section-heading">
            <h2>{t.server.title}</h2>
          </div>

          {error && <div className="form-error">{error}</div>}

          <label className="field">
            <span>{t.finance.date}</span>
            <input type="date" value={occurredOn} onChange={event => setOccurredOn(event.target.value)} />
          </label>

          <div className="transfer-server-grid">
            <label className="field">
              <span>{t.server.from}</span>
              <select value={fromServer} onChange={event => setFromServer(event.target.value as MapleServer)}>
                {MAPLE_SERVERS.map(server => (
                  <option key={server} value={server}>{getMapleServerLabel(t, server)}</option>
                ))}
              </select>
            </label>
            <button className="icon-button transfer-flip-button" type="button" onClick={flipServers} title={t.server.title}>
              <ArrowRightLeft size={18} />
            </button>
            <label className="field">
              <span>{t.server.to}</span>
              <select value={toServer} onChange={event => setToServer(event.target.value as MapleServer)}>
                {MAPLE_SERVERS.map(server => (
                  <option key={server} value={server}>{getMapleServerLabel(t, server)}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field">
            <span>{t.server.amount}</span>
            <GoldAmountFields t={t} eok={amountEok} man={amountMan} onEokChange={setAmountEok} onManChange={setAmountMan} />
          </div>

          <div className="field">
            <span>{t.server.oppaAmount}</span>
            <GoldAmountFields
              t={t}
              eok={oppaAmountEok}
              man={oppaAmountMan}
              onEokChange={setOppaAmountEok}
              onManChange={setOppaAmountMan}
            />
          </div>

          <div className="transfer-preview">
            <div>
              <span>{t.server.fee}</span>
              <strong>- {fmt(fee)}</strong>
            </div>
            <div>
              <span>{t.server.received}</span>
              <strong>{fmt(received)}</strong>
            </div>
            <div>
              <span>{t.server.oppaFee}</span>
              <strong>- {fmt(oppaFee)}</strong>
            </div>
            <div>
              <span>{t.server.oppaReceived}</span>
              <strong>{fmt(oppaReceived)}</strong>
            </div>
          </div>

          <label className="field">
            <span>{t.finance.memo}</span>
            <textarea placeholder={t.finance.cashMemoPlaceholder} value={memo} onChange={event => setMemo(event.target.value)} />
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            <Plus size={18} aria-hidden="true" />
            {saving ? t.finance.saving : t.server.save}
          </button>
        </form>

        <section className="records-panel finance-records-panel">
          <div className="section-heading">
            <h2>{t.server.recent}</h2>
            <span className="count-pill">{entries.length}{t.misc.records}</span>
          </div>
          {loading ? (
            <div className="empty-state">{t.finance.loading}</div>
          ) : recentEntries.length === 0 ? (
            <div className="empty-state mascot-empty">{t.server.noRecord}</div>
          ) : (
            <div className="entry-list">
              {recentEntries.map(entry => (
                <TransferRow key={entry.id} t={t} entry={entry} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="summary-card accent">
      <div className="summary-icon"><ArrowRightLeft size={20} /></div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function TransferRow({ t, entry, onDelete }: { t: T; entry: ServerTransfer; onDelete: (id: string) => void }) {
  const fmt = (value: number) => formatMesoT(value, t.units)
  return (
    <article className="entry-item finance-entry-item">
      <div className="entry-main">
        <span className="entry-badge neutral">
          {getMapleServerLabel(t, entry.from_server)} → {getMapleServerLabel(t, entry.to_server)}
        </span>
        <strong>{fmt(entry.oppa_received_meso)}</strong>
        <p>
          {entry.occurred_on} · {t.server.amount} {fmt(entry.amount_meso)} · {t.server.oppaAmount} {fmt(entry.oppa_amount_meso)}
        </p>
        <p>
          {t.server.fee} {fmt(entry.fee_meso)} · {t.server.oppaReceived} {fmt(entry.oppa_received_meso)}
        </p>
        {entry.memo && <p className="memo">{entry.memo}</p>}
      </div>
      <div className="entry-actions">
        <button className="icon-button danger" type="button" onClick={() => onDelete(entry.id)} title={t.finance.delete}>
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}
