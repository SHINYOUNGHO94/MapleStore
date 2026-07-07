import { useMemo, useState } from 'react'
import {
  Banknote,
  BookOpen,
  CircleDollarSign,
  Coins,
  Home,
  Landmark,
  Plus,
  WalletCards,
} from 'lucide-react'
import { getSettlementInfo, todayInputValue, type Summary } from '../lib/calculations'
import type { CashSummary } from '../lib/financeCalculations'
import { formatCash } from '../lib/format'
import { formatMesoT, type Lang, type T } from '../lib/i18n'
import { fromMeso, toMeso } from '../lib/units'
import type {
  Account,
  CashCurrency,
  CashEntry,
  CashEntryDraft,
  CashGame,
  CashOwner,
  EntryDirection,
  EntryType,
  LedgerEntry,
  LedgerEntryDraft,
} from '../types'

type MobileTab = 'home' | 'gold' | 'cash' | 'records'

type Props = {
  t: T
  lang: Lang
  summary: Summary
  accounts: Account[]
  entries: LedgerEntry[]
  cashEntries: CashEntry[]
  cashSummary: CashSummary
  weekStart: string
  loading: boolean
  saving: boolean
  status: string
  onLangChange: (lang: Lang) => void
  onSaveLedger: (draft: LedgerEntryDraft) => Promise<void>
  onSaveCash: (draft: CashEntryDraft) => Promise<void>
}

export default function MobileApp({
  t,
  lang,
  summary,
  accounts,
  entries,
  cashEntries,
  cashSummary,
  weekStart,
  loading,
  saving,
  status,
  onLangChange,
  onSaveLedger,
  onSaveCash,
}: Props) {
  const [tab, setTab] = useState<MobileTab>('home')
  const settlement = getSettlementInfo(summary)
  const gfAccount = accounts.find(account => !account.is_mine) ?? accounts[0]
  const claimLabel = gfAccount ? `${gfAccount.name} ${t.dashboard.myMoneySuffix}` : t.dashboard.myClaimInGfAccount
  const cashFmt = (value: number, currency: CashCurrency) => formatCash(value, currency, { KRW: t.finance.won, JPY: t.finance.yen })

  return (
    <main className="mobile-app">
      <header className="mobile-top">
        <div className="mobile-brand">
          <img src="/assets/mobile/app-icon.png" alt="" />
          <div>
            <span>{t.header.brand}</span>
            <strong>{t.header.appTitle}</strong>
          </div>
        </div>
        <div className="mobile-lang">
          <button className={lang === 'ko' ? 'active' : ''} type="button" onClick={() => onLangChange('ko')}>KR</button>
          <button className={lang === 'ja' ? 'active' : ''} type="button" onClick={() => onLangChange('ja')}>JP</button>
        </div>
      </header>

      {status && <div className="mobile-status">{status}</div>}

      <section className="mobile-content">
        {tab === 'home' && (
          <MobileHome
            t={t}
            summary={summary}
            settlement={settlement}
            claimLabel={claimLabel}
            cashSummary={cashSummary}
            cashFmt={cashFmt}
            weekStart={weekStart}
            loading={loading}
            entries={entries}
            onQuickAdd={() => setTab('gold')}
          />
        )}
        {tab === 'gold' && (
          <MobileGoldForm
            t={t}
            accounts={accounts}
            summary={summary}
            saving={saving}
            onSave={onSaveLedger}
          />
        )}
        {tab === 'cash' && (
          <MobileCashForm
            t={t}
            saving={saving}
            cashSummary={cashSummary}
            cashFmt={cashFmt}
            onSave={onSaveCash}
          />
        )}
        {tab === 'records' && (
          <MobileRecords
            t={t}
            entries={entries}
            cashEntries={cashEntries}
            cashFmt={cashFmt}
          />
        )}
      </section>

      <nav className="mobile-nav" aria-label="mobile app nav">
        <MobileNavButton active={tab === 'home'} icon={<Home size={19} />} label={t.tabs.home} onClick={() => setTab('home')} />
        <MobileNavButton active={tab === 'gold'} icon={<Plus size={19} />} label={t.tabs.add} onClick={() => setTab('gold')} />
        <MobileNavButton active={tab === 'cash'} icon={<CircleDollarSign size={19} />} label={t.tabs.cash} onClick={() => setTab('cash')} />
        <MobileNavButton active={tab === 'records'} icon={<BookOpen size={19} />} label={t.tabs.ledger} onClick={() => setTab('records')} />
      </nav>
    </main>
  )
}

function MobileHome({
  t,
  summary,
  settlement,
  claimLabel,
  cashSummary,
  cashFmt,
  weekStart,
  loading,
  entries,
  onQuickAdd,
}: {
  t: T
  summary: Summary
  settlement: ReturnType<typeof getSettlementInfo>
  claimLabel: string
  cashSummary: CashSummary
  cashFmt: (value: number, currency: CashCurrency) => string
  weekStart: string
  loading: boolean
  entries: LedgerEntry[]
  onQuickAdd: () => void
}) {
  const fmt = (value: number) => formatMesoT(value, t.units)
  const latest = entries.slice(0, 4)

  return (
    <div className="mobile-stack">
      <section className="mobile-hero-card">
        <div>
          <span>{weekStart}</span>
          <h1>{t.dashboard.thisWeekNet}</h1>
          <strong>{fmt(summary.thisWeekNet)}</strong>
        </div>
        <button type="button" onClick={onQuickAdd}>
          <Plus size={18} />
          {t.dashboard.newEntry}
        </button>
      </section>

      <section className="mobile-card-grid">
        <MobileMetric icon={<WalletCards size={18} />} label={t.dashboard.debtToGf} value={fmt(summary.debtToGirlfriend)} />
        <MobileMetric icon={<Coins size={18} />} label={claimLabel} value={fmt(summary.myClaimOnGirlfriendAccount)} />
        <MobileMetric icon={<Banknote size={18} />} label={t.dashboard.myNetWorth} value={fmt(settlement.netWorth)} />
        <MobileMetric icon={<Landmark size={18} />} label={t.finance.cashWon} value={cashFmt(cashSummary.ownerBalances.aya.KRW, 'KRW')} />
      </section>

      <section className="mobile-panel">
        <div className="mobile-section-head">
          <h2>{t.dashboard.keyStatus}</h2>
        </div>
        <div className="mobile-row-list">
          <MobileInfoRow label={t.dashboard.bossTotal} value={fmt(summary.bossIncome)} />
          <MobileInfoRow label={t.dashboard.bossCostTotal} value={fmt(summary.totalBossCost)} />
          <MobileInfoRow label={t.dashboard.girlfriendContribution} value={fmt(summary.girlfriendContribution)} />
        </div>
      </section>

      <section className="mobile-panel">
        <div className="mobile-section-head">
          <h2>{t.dashboard.recentRecords}</h2>
        </div>
        {loading ? (
          <div className="mobile-empty">{t.dashboard.loading}</div>
        ) : latest.length === 0 ? (
          <div className="mobile-empty">{t.dashboard.noRecord}</div>
        ) : (
          <div className="mobile-row-list">
            {latest.map(entry => (
              <MobileInfoRow
                key={entry.id}
                label={t.entryTypes[entry.entry_type] ?? entry.entry_type}
                value={fmt(Number(entry.amount_meso))}
                sub={entry.memo || entry.boss_name || entry.occurred_on}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MobileGoldForm({
  t,
  accounts,
  summary,
  saving,
  onSave,
}: {
  t: T
  accounts: Account[]
  summary: Summary
  saving: boolean
  onSave: (draft: LedgerEntryDraft) => Promise<void>
}) {
  const fallbackAccount = accounts.find(account => !account.is_mine) ?? accounts[0]
  const [date, setDate] = useState(todayInputValue())
  const [type, setType] = useState<EntryType>('boss_income')
  const [accountId, setAccountId] = useState(fallbackAccount?.id ?? '')
  const [eok, setEok] = useState('')
  const [man, setMan] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const selectedSettlement = getSettlementInfo(summary, accountId)
  const fmt = (value: number) => formatMesoT(value, t.units)
  const types: EntryType[] = ['boss_income', 'boss_cost_girlfriend', 'boss_cost_my', 'repay_girlfriend', 'withdraw_my_share']

  function fillSettlement(kind: 'repay' | 'withdraw') {
    const amount = kind === 'repay' ? selectedSettlement.repayable : selectedSettlement.withdrawable
    if (amount <= 0) {
      setError(t.form.autoFillUnavailable)
      return
    }
    const next = fromMeso(amount)
    setEok(next.eok)
    setMan(next.man)
    setError('')
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const amount = toMeso(eok, man)
    if (amount <= 0) {
      setError(t.form.amountError)
      return
    }
    if (!accountId) {
      setError(t.form.accountError)
      return
    }
    await onSave({
      occurred_on: date,
      entry_type: type,
      account_id: accountId,
      amount_meso: amount,
      boss_name: type === 'boss_income' ? memo.trim() || null : null,
      memo: type === 'boss_income' ? null : memo.trim() || null,
    })
    setEok('')
    setMan('')
    setMemo('')
    setError('')
  }

  return (
    <form className="mobile-panel mobile-form" onSubmit={event => void submit(event)}>
      <div className="mobile-section-head">
        <h2>{t.form.addTitle}</h2>
      </div>

      {error && <div className="mobile-error">{error}</div>}

      <label>
        <span>{t.form.date}</span>
        <input type="date" value={date} onChange={event => setDate(event.target.value)} />
      </label>

      <div>
        <span>{t.form.type}</span>
        <div className="mobile-chip-grid">
          {types.map(item => (
            <button key={item} className={type === item ? 'active' : ''} type="button" onClick={() => setType(item)}>
              {t.entryTypes[item]}
            </button>
          ))}
        </div>
      </div>

      <label>
        <span>{t.form.account}</span>
        <select value={accountId} onChange={event => setAccountId(event.target.value)}>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
      </label>

      {(type === 'repay_girlfriend' || type === 'withdraw_my_share') && (
        <div className="mobile-quick-row">
          <button type="button" onClick={() => fillSettlement('repay')}>
            {t.form.autoFillRepay} {fmt(selectedSettlement.repayable)}
          </button>
          <button type="button" onClick={() => fillSettlement('withdraw')}>
            {t.form.autoFillWithdraw} {fmt(selectedSettlement.withdrawable)}
          </button>
        </div>
      )}

      <div>
        <span>{t.form.amount}</span>
        <div className="mobile-amount-grid">
          <input inputMode="numeric" type="number" min="0" placeholder={t.units.eok} value={eok} onChange={event => setEok(event.target.value)} />
          <input inputMode="numeric" type="number" min="0" placeholder={t.units.man} value={man} onChange={event => setMan(event.target.value)} />
        </div>
      </div>

      <label>
        <span>{type === 'boss_income' ? t.form.boss : t.form.memo}</span>
        <input value={memo} placeholder={type === 'boss_income' ? t.form.bossPlaceholder : t.form.memoPlaceholder} onChange={event => setMemo(event.target.value)} />
      </label>

      <button className="mobile-primary" type="submit" disabled={saving}>
        {saving ? t.form.saving : t.form.add}
      </button>
    </form>
  )
}

function MobileCashForm({
  t,
  saving,
  cashSummary,
  cashFmt,
  onSave,
}: {
  t: T
  saving: boolean
  cashSummary: CashSummary
  cashFmt: (value: number, currency: CashCurrency) => string
  onSave: (draft: CashEntryDraft) => Promise<void>
}) {
  const [date, setDate] = useState(todayInputValue())
  const [owner, setOwner] = useState<CashOwner>('aya')
  const [game, setGame] = useState<CashGame>('maple')
  const [direction, setDirection] = useState<EntryDirection>('deposit')
  const [currency, setCurrency] = useState<CashCurrency>('KRW')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const numericAmount = Math.floor(Number(amount))
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t.finance.cashAmountError)
      return
    }
    await onSave({
      occurred_on: date,
      owner,
      game,
      direction,
      currency,
      amount_cash: numericAmount,
      memo: memo.trim() || null,
    })
    setAmount('')
    setMemo('')
    setError('')
  }

  return (
    <div className="mobile-stack">
      <section className="mobile-card-grid">
        <MobileMetric icon={<CircleDollarSign size={18} />} label={t.finance.cashWon} value={cashFmt(cashSummary.ownerBalances.aya.KRW, 'KRW')} />
        <MobileMetric icon={<CircleDollarSign size={18} />} label={t.finance.oppaCashWon} value={cashFmt(cashSummary.ownerBalances.oppa.KRW, 'KRW')} />
      </section>

      <form className="mobile-panel mobile-form" onSubmit={event => void submit(event)}>
        <div className="mobile-section-head">
          <h2>{t.finance.cashFormTitle}</h2>
        </div>

        {error && <div className="mobile-error">{error}</div>}

        <label>
          <span>{t.finance.date}</span>
          <input type="date" value={date} onChange={event => setDate(event.target.value)} />
        </label>

        <div>
          <span>{t.finance.owner}</span>
          <div className="mobile-chip-grid two">
            <button className={owner === 'aya' ? 'active' : ''} type="button" onClick={() => setOwner('aya')}>{t.finance.ownerAya}</button>
            <button className={owner === 'oppa' ? 'active' : ''} type="button" onClick={() => setOwner('oppa')}>{t.finance.ownerOppa}</button>
          </div>
        </div>

        <div>
          <span>{t.finance.game}</span>
          <div className="mobile-chip-grid two">
            <button className={game === 'maple' ? 'active' : ''} type="button" onClick={() => setGame('maple')}>Maple</button>
            <button className={game === 'lostark' ? 'active' : ''} type="button" onClick={() => setGame('lostark')}>LostArk</button>
          </div>
        </div>

        <div>
          <span>{t.finance.direction}</span>
          <div className="mobile-chip-grid two">
            <button className={direction === 'deposit' ? 'active' : ''} type="button" onClick={() => setDirection('deposit')}>{t.finance.deposit}</button>
            <button className={direction === 'withdraw' ? 'active' : ''} type="button" onClick={() => setDirection('withdraw')}>{t.finance.withdraw}</button>
          </div>
        </div>

        <div>
          <span>{t.finance.currency}</span>
          <div className="mobile-chip-grid two">
            <button className={currency === 'KRW' ? 'active' : ''} type="button" onClick={() => setCurrency('KRW')}>{t.finance.won}</button>
            <button className={currency === 'JPY' ? 'active' : ''} type="button" onClick={() => setCurrency('JPY')}>{t.finance.yen}</button>
          </div>
        </div>

        <label>
          <span>{t.finance.amount}</span>
          <input inputMode="numeric" type="number" min="0" placeholder={t.finance.amountPlaceholder} value={amount} onChange={event => setAmount(event.target.value)} />
        </label>

        <label>
          <span>{t.finance.memo}</span>
          <input value={memo} placeholder={t.finance.cashMemoPlaceholder} onChange={event => setMemo(event.target.value)} />
        </label>

        <button className="mobile-primary" type="submit" disabled={saving}>
          {saving ? t.finance.saving : t.finance.cashSave}
        </button>
      </form>
    </div>
  )
}

function MobileRecords({
  t,
  entries,
  cashEntries,
  cashFmt,
}: {
  t: T
  entries: LedgerEntry[]
  cashEntries: CashEntry[]
  cashFmt: (value: number, currency: CashCurrency) => string
}) {
  const fmt = (value: number) => formatMesoT(value, t.units)
  const records = useMemo(() => [
    ...entries.slice(0, 12).map(entry => ({
      id: `ledger-${entry.id}`,
      date: entry.occurred_on,
      label: t.entryTypes[entry.entry_type] ?? entry.entry_type,
      value: fmt(Number(entry.amount_meso)),
      sub: entry.memo || entry.boss_name || 'Maple',
      createdAt: entry.created_at,
    })),
    ...cashEntries.slice(0, 12).map(entry => ({
      id: `cash-${entry.id}`,
      date: entry.occurred_on,
      label: `${entry.owner === 'oppa' ? t.finance.ownerOppa : t.finance.ownerAya} · ${entry.game === 'maple' ? 'Maple' : 'LostArk'}`,
      value: `${entry.direction === 'deposit' ? '+' : '-'}${cashFmt(entry.amount_cash, entry.currency)}`,
      sub: entry.memo || t.finance.cashBadge,
      createdAt: entry.created_at,
    })),
  ].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.createdAt.localeCompare(a.createdAt)
  }).slice(0, 18), [cashEntries, cashFmt, entries, fmt, t])

  return (
    <section className="mobile-panel">
      <div className="mobile-section-head">
        <h2>{t.dashboard.recentRecords}</h2>
      </div>
      {records.length === 0 ? (
        <div className="mobile-empty">{t.dashboard.noRecord}</div>
      ) : (
        <div className="mobile-row-list">
          {records.map(record => (
            <MobileInfoRow key={record.id} label={record.label} value={record.value} sub={`${record.date} · ${record.sub}`} />
          ))}
        </div>
      )}
    </section>
  )
}

function MobileMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="mobile-metric">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function MobileInfoRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="mobile-info-row">
      <div>
        <span>{label}</span>
        {sub && <p>{sub}</p>}
      </div>
      <strong>{value}</strong>
    </div>
  )
}

function MobileNavButton({
  active, icon, label, onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button className={active ? 'active' : ''} type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
