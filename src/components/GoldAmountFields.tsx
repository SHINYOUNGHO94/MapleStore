import type { T } from '../lib/i18n'

type Props = {
  t: T
  eok: string
  man: string
  onEokChange: (value: string) => void
  onManChange: (value: string) => void
}

export default function GoldAmountFields({ t, eok, man, onEokChange, onManChange }: Props) {
  return (
    <div className="gold-amount-fields">
      <label className="field amount-field">
        <span>{t.units.eok}</span>
        <input
          inputMode="decimal"
          placeholder="0"
          value={eok}
          onChange={e => onEokChange(e.target.value)}
        />
      </label>
      <label className="field amount-field">
        <span>{t.units.man}</span>
        <input
          inputMode="decimal"
          placeholder="0"
          value={man}
          onChange={e => onManChange(e.target.value)}
        />
      </label>
    </div>
  )
}
