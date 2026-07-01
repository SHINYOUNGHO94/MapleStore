const eok = 100_000_000
const jo = 10_000 * eok
const man = 10_000

export function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function formatMeso(value: number) {
  const sign = value < 0 ? '-' : ''
  const absolute = Math.abs(Math.round(value))

  if (absolute === 0) return '0'

  const joPart = Math.floor(absolute / jo)
  const eokPart = Math.floor((absolute % jo) / eok)
  const manPart = Math.floor((absolute % eok) / man)
  const parts: string[] = []
  if (joPart) parts.push(`${formatNumber(joPart)}조`)
  if (eokPart) parts.push(`${formatNumber(eokPart)}억`)
  if (!joPart && manPart) parts.push(`${formatNumber(manPart)}만`)
  return parts.length > 0 ? `${sign}${parts.join(' ')}` : '0'
}
