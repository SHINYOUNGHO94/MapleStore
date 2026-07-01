const EOK = 100_000_000
const MAN = 10_000

export function floorToMan(amount_meso: number): number {
  return Math.trunc(Number(amount_meso) / MAN) * MAN
}

export function toMeso(eok: string, man: string): number {
  const eokNum = Number(eok.replaceAll(',', '')) || 0
  const manNum = Number(man.replaceAll(',', '')) || 0
  return Math.round(eokNum * EOK + manNum * MAN)
}

export function fromMeso(amount_meso: number): { eok: string; man: string } {
  const normalized = floorToMan(amount_meso)
  const eok = Math.trunc(normalized / EOK)
  const man = Math.trunc((normalized - eok * EOK) / MAN)
  return {
    eok: eok === 0 ? '' : String(eok),
    man: man === 0 ? '' : String(man),
  }
}
