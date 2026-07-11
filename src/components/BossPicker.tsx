import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getBossImageUrl, getSortedBossPresets } from '../lib/bossData'
import { formatMesoT, type T } from '../lib/i18n'
import { floorToMan } from '../lib/units'
import type { LedgerEntryDraft, MapleServer } from '../types'

type CartItem = {
  key: string
  bossName: string
  difficultyLabel: string
  price: number
}

type Props = {
  t: T
  occurredOn: string
  server: MapleServer
  accountId: string
  saving: boolean
  onSaveMany: (drafts: LedgerEntryDraft[]) => Promise<void>
}

export default function BossPicker({ t, occurredOn, server, accountId, saving, onSaveMany }: Props) {
  const [openBossId, setOpenBossId] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const bosses = getSortedBossPresets()
  const fmt = (v: number) => formatMesoT(v, t.units)
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  function addToCart(bossName: string, difficultyLabel: string, price: number) {
    setCart(prev => [...prev, {
      key: `${Date.now()}-${Math.random()}`,
      bossName,
      difficultyLabel,
      price: floorToMan(price),
    }])
    setOpenBossId(null)
  }

  function removeFromCart(key: string) {
    setCart(prev => prev.filter(item => item.key !== key))
  }

  async function commit() {
    if (cart.length === 0 || !accountId) return
    const drafts: LedgerEntryDraft[] = cart.map(item => ({
      occurred_on: occurredOn,
      server,
      entry_type: 'boss_income',
      account_id: accountId,
      amount_meso: item.price,
      boss_name: `${item.bossName} ${item.difficultyLabel}`,
      memo: null,
    }))
    await onSaveMany(drafts)
    setCart([])
  }

  return (
    <div className="boss-picker">
      <div className="boss-list">
        {bosses.map(boss => {
          const bossName = t.bossNames[boss.id] ?? boss.name
          return (
          <div key={boss.id} className={`boss-row ${openBossId === boss.id ? 'open' : ''}`}>
            <button
              className="boss-row-main"
              type="button"
              onClick={() => setOpenBossId(prev => (prev === boss.id ? null : boss.id))}
            >
              <img src={getBossImageUrl(boss.image)} alt={bossName} className="boss-thumb" />
              <span className="boss-name">{bossName}</span>
            </button>
            {openBossId === boss.id && (
              <div className="boss-difficulty-row">
                {boss.difficulties.map(d => {
                  const difficultyLabel = t.difficultyNames[d.label] ?? d.label
                  return (
                  <button
                    key={d.label}
                    className="boss-difficulty-button"
                    type="button"
                    onClick={() => addToCart(bossName, difficultyLabel, d.price)}
                  >
                    <span>{difficultyLabel}</span>
                    <strong>{fmt(d.price)}</strong>
                  </button>
                  )
                })}
              </div>
            )}
          </div>
          )
        })}
      </div>

      <div className="boss-cart">
        <span className="boss-cart-title">{t.form.bossCartTitle}</span>
        {cart.length === 0 ? (
          <p className="empty-state gold-empty">{t.form.bossCartEmpty}</p>
        ) : (
          <div className="boss-cart-list">
            {cart.map(item => (
              <div key={item.key} className="boss-cart-row">
                <span>{item.bossName} {item.difficultyLabel}</span>
                <strong>{fmt(item.price)}</strong>
                <button className="icon-button danger" type="button" onClick={() => removeFromCart(item.key)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="boss-cart-total">
          <span>{t.form.bossCartTotal}</span>
          <strong>{fmt(total)}</strong>
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={saving || cart.length === 0}
          onClick={() => void commit()}
        >
          <Plus size={18} aria-hidden="true" />
          {saving ? t.form.saving : t.form.bossCartAdd}
        </button>
      </div>
    </div>
  )
}
