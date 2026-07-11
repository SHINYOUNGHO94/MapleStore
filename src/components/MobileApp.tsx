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
  MapleServer,
  MapleServerFilter,
} from '../types'
import { DEFAULT_MAPLE_SERVER, getMapleServerLabel, MAPLE_SERVERS } from '../lib/mapleServers'

type MobileTab = 'home' | 'gold' | 'cash' | 'records'

type Props = {
  t: T
  lang: Lang
  fullSummary: Summary
  accounts: Account[]
  entries: LedgerEntry[]
  cashEntries: CashEntry[]
  cashSummary: CashSummary
  serverFilter: MapleServerFilter
  weekStart: string
  loading: boolean
  saving: boolean
  status: string
  onLangChange: (lang: Lang) => void
  onSaveLedger: (draft: LedgerEntryDraft) => Promise<void>
  onSaveCash: (draft: CashEntryDraft) => Promise<void>
  onServerFilterChange: (server: MapleServerFilter) => void
}

export default function MobileApp({
  t,
  lang,
  fullSummary,
  accounts,
  entries,
  cashEntries,
  cashSummary,
  serverFilter,
  weekStart,
  loading,
  saving,
  status,
  onLangChange,
  onSaveLedger,
  onSaveCash,
  onServerFilterChange,
}: Props) {
  const [tab, setTab] = useState<MobileTab>('home')
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
            fullSummary={fullSummary}
            claimLabel={claimLabel}
            cashSummary={cashSummary}
            cashFmt={cashFmt}
            serverFilter={serverFilter}
            onServerFilterChange={onServerFilterChange}
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
            summary={fullSummary}
            serverFilter={serverFilter}
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
  fullSummary,
  claimLabel,
  cashSummary,
  cashFmt,
  serverFilter,
  onServerFilterChange,
  weekStart,
  loading,
  entries,
  onQuickAdd,
}: {
  t: T
  fullSummary: Summary
  claimLabel: string
  cashSummary: CashSummary
  cashFmt: (value: number, currency: CashCurrency) => string
  serverFilter: MapleServerFilter
  onServerFilterChange: (server: MapleServerFilter) => void
  weekStart: string
  loading: boolean
  entries: LedgerEntry[]
  onQuickAdd: () => void
}) {
  const fmt = (value: number) => formatMesoT(value, t.units)
  const activeServer: MapleServer = serverFilter === 'all' ? DEFAULT_MAPLE_SERVER : serverFilter
  const activeServerName = getMapleServerLabel(t, activeServer)
  const latest = entries.filter(entry => entry.server === activeServer).slice(0, 4)
  const thisWeekNet = entries.reduce((sum, entry) => {
    if (entry.server !== activeServer || entry.occurred_on < weekStart) return sum
    const amount = Number(entry.amount_meso) || 0
    if (entry.entry_type === 'boss_income') return sum + amount
    if (entry.entry_type === 'boss_cost_my' || entry.entry_type === 'boss_cost_girlfriend') return sum - amount
    return sum
  }, 0)
  const selectedContribution = entries.reduce((sum, entry) => {
    if (entry.server !== activeServer || entry.entry_type !== 'girlfriend_contribution') return sum
    return sum + (Number(entry.amount_meso) || 0)
  }, 0)

  return (
    <div className="mobile-stack">
      <section className="mobile-hero-card">
        <div>
          <span>{weekStart}</span>
          <h1>{activeServerName} {t.dashboard.thisWeekNet}</h1>
          <strong>{fmt(thisWeekNet)}</strong>
        </div>
        <button type="button" onClick={onQuickAdd}>
          <Plus size={18} />
          {t.dashboard.newEntry}
        </button>
      </section>

      <div className="mobile-chip-grid">
        {MAPLE_SERVERS.map(server => (
          <button key={server} className={activeServer === server ? 'active' : ''} type="button" onClick={() => onServerFilterChange(server)}>
            {getMapleServerLabel(t, server)}
          </button>
        ))}
      </div>

      <section className="mobile-server-wallet-list">
        {MAPLE_SERVERS.map(server => (
          <MobileServerWallet
            key={server}
            t={t}
            server={server}
            claimLabel={claimLabel}
            claim={fullSummary.myClaimByServer[server] ?? 0}
            debt={fullSummary.debtByServer[server] ?? 0}
            fmt={fmt}
          />
        ))}
      </section>

      <section className="mobile-card-grid">
        <MobileMetric icon={<WalletCards size={18} />} label={`${activeServerName} ${t.dashboard.bossTotal}`} value={fmt(fullSummary.bossIncomeByServer[activeServer] ?? 0)} />
        <MobileMetric icon={<Coins size={18} />} label={`${activeServerName} ${t.dashboard.bossCostTotal}`} value={fmt(fullSummary.bossCostByServer[activeServer] ?? 0)} />
        <MobileMetric icon={<Banknote size={18} />} label={`${activeServerName} ${t.server.fee}`} value={fmt(fullSummary.transferFeeByServer[activeServer] ?? 0)} />
        <MobileMetric icon={<Landmark size={18} />} label={t.finance.cashWon} value={cashFmt(cashSummary.ownerBalances.aya.KRW, 'KRW')} />
      </section>

      <section className="mobile-panel">
        <div className="mobile-section-head">
          <h2>{t.dashboard.keyStatus}</h2>
        </div>
        <div className="mobile-row-list">
          <MobileInfoRow label={`${activeServerName} ${t.dashboard.bossTotal}`} value={fmt(fullSummary.bossIncomeByServer[activeServer] ?? 0)} />
          <MobileInfoRow label={`${activeServerName} ${t.dashboard.bossCostTotal}`} value={fmt(fullSummary.bossCostByServer[activeServer] ?? 0)} />
          <MobileInfoRow label={`${activeServerName} ${t.dashboard.girlfriendContribution}`} value={fmt(selectedContribution)} />
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
  serverFilter,
  saving,
  onSave,
}: {
  t: T
  accounts: Account[]
  summary: Summary
  serverFilter: MapleServerFilter
  saving: boolean
  onSave: (draft: LedgerEntryDraft) => Promise<void>
}) {
  const fallbackAccount = accounts.find(account => !account.is_mine) ?? accounts[0]
  const [date, setDate] = useState(todayInputValue())
  const [server, setServer] = useState<MapleServer>(serverFilter === 'all' ? DEFAULT_MAPLE_SERVER : serverFilter)
  const [type, setType] = useState<EntryType>('boss_income')
  const [accountId, setAccountId] = useState(fallbackAccount?.id ?? '')
  const [eok, setEok] = useState('')
  const [man, setMan] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const selectedSettlement = getSettlementInfo(summary, accountId, server)
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
      server,
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

      <label>
        <span>{t.server.field}</span>
        <select value={server} onChange={event => setServer(event.target.value as MapleServer)}>
          {MAPLE_SERVERS.map(item => (
            <option key={item} value={item}>{getMapleServerLabel(t, item)}</option>
          ))}
        </select>
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
        <div className="mobile-settlement-panel">
          <MobileInfoRow label={t.server.field} value={getMapleServerLabel(t, server)} />
          <MobileInfoRow label={t.form.selectedAccountClaim} value={fmt(selectedSettlement.claim)} />
          <div className="mobile-quick-row">
            <button type="button" onClick={() => fillSettlement('repay')}>
              {t.form.autoFillRepay} {fmt(selectedSettlement.repayable)}
            </button>
            <button type="button" onClick={() => fillSettlement('withdraw')}>
              {t.form.autoFillWithdraw} {fmt(selectedSettlement.withdrawable)}
            </button>
          </div>
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
  const records = useMemo(() => [
    ...entries.slice(0, 12).map(entry => ({
      id: `ledger-${entry.id}`,
      date: entry.occurred_on,
      label: t.entryTypes[entry.entry_type] ?? entry.entry_type,
      value: formatMesoT(Number(entry.amount_meso), t.units),
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
  }).slice(0, 18), [cashEntries, cashFmt, entries, t])

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

function MobileServerWallet({
  t, server, claimLabel, claim, debt, fmt,
}: {
  t: T
  server: MapleServer
  claimLabel: string
  claim: number
  debt: number
  fmt: (value: number) => string
}) {
  const net = claim - debt
  return (
    <article className="mobile-server-wallet">
      <div>
        <span>{getMapleServerLabel(t, server)}</span>
        <strong>{fmt(claim)}</strong>
      </div>
      <div className="mobile-server-wallet-lines">
        <MobileInfoRow label={claimLabel} value={fmt(claim)} />
        <MobileInfoRow label={t.dashboard.debtToGf} value={fmt(debt)} />
        <MobileInfoRow label={t.dashboard.myNetWorth} value={fmt(net)} />
      </div>
    </article>
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
