import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getItemImageUrl, ITEM_PRESETS } from '../lib/itemData'
import { formatMesoT, type T } from '../lib/i18n'
import type { LedgerEntryDraft } from '../types'

type CartItem = {
  key: string
  name: string
  price: number
}

type Props = {
  t: T
  occurredOn: string
  accountId: string
  saving: boolean
  onSaveMany: (drafts: LedgerEntryDraft[]) => Promise<void>
}

export default function ItemPicker({ t, occurredOn, accountId, saving, onSaveMany }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const fmt = (v: number) => formatMesoT(v, t.units)
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  function addToCart(name: string, price: number) {
    setCart(prev => [...prev, { key: `${Date.now()}-${Math.random()}`, name, price }])
  }

  function removeFromCart(key: string) {
    setCart(prev => prev.filter(item => item.key !== key))
  }

  async function commit() {
    if (cart.length === 0 || !accountId) return
    const drafts: LedgerEntryDraft[] = cart.map(item => ({
      occurred_on: occurredOn,
      entry_type: 'boss_cost_girlfriend',
      account_id: accountId,
      amount_meso: item.price,
      boss_name: item.name,
      memo: null,
    }))
    await onSaveMany(drafts)
    setCart([])
  }

  return (
    <div className="item-picker">
      <div className="item-list">
        {ITEM_PRESETS.map(item => (
          <button
            key={item.id}
            className="item-card"
            type="button"
            onClick={() => addToCart(item.name, item.price)}
          >
            <img src={getItemImageUrl(item.image)} alt={item.name} className="item-thumb" />
            <span className="item-name">{item.name}</span>
            <strong className="item-price">{fmt(item.price)}</strong>
          </button>
        ))}
      </div>

      <div className="boss-cart">
        <span className="boss-cart-title">{t.form.itemCartTitle}</span>
        {cart.length === 0 ? (
          <p className="empty-state gold-empty">{t.form.itemCartEmpty}</p>
        ) : (
          <div className="boss-cart-list">
            {cart.map(item => (
              <div key={item.key} className="boss-cart-row">
                <span>{item.name}</span>
                <strong>{fmt(item.price)}</strong>
                <button className="icon-button danger" type="button" onClick={() => removeFromCart(item.key)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="boss-cart-total">
          <span>{t.form.itemCartTotal}</span>
          <strong>{fmt(total)}</strong>
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={saving || cart.length === 0}
          onClick={() => void commit()}
        >
          <Plus size={18} aria-hidden="true" />
          {saving ? t.form.saving : t.form.itemCartAdd}
        </button>
      </div>
    </div>
  )
}
