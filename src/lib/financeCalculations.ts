import type { CashEntry, CashCurrency, LostArkEntry } from '../types'

export type CashSummary = {
  balances: Record<CashCurrency, number>
  deposits: Record<CashCurrency, number>
  withdrawals: Record<CashCurrency, number>
}

export type LostArkSummary = {
  balanceGold: number
  depositGold: number
  withdrawalGold: number
  feeGold: number
}

const emptyCash = (): Record<CashCurrency, number> => ({ KRW: 0, JPY: 0 })

export function buildCashSummary(entries: CashEntry[]): CashSummary {
  const balances = emptyCash()
  const deposits = emptyCash()
  const withdrawals = emptyCash()

  for (const entry of entries) {
    const amount = Math.floor(Number(entry.amount_cash) || 0)
    if (entry.direction === 'deposit') {
      deposits[entry.currency] += amount
      balances[entry.currency] += amount
    } else {
      withdrawals[entry.currency] += amount
      balances[entry.currency] -= amount
    }
  }

  return { balances, deposits, withdrawals }
}

export function buildLostArkSummary(entries: LostArkEntry[]): LostArkSummary {
  let balanceGold = 0
  let depositGold = 0
  let withdrawalGold = 0
  let feeGold = 0

  for (const entry of entries) {
    const net = Math.floor(Number(entry.net_gold) || 0)
    const gross = Math.floor(Number(entry.gross_gold) || 0)
    if (entry.direction === 'deposit') {
      depositGold += net
      balanceGold += net
      feeGold += Math.max(0, gross - net)
    } else {
      withdrawalGold += net
      balanceGold -= net
    }
  }

  return { balanceGold, depositGold, withdrawalGold, feeGold }
}

export function applyLostArkFee(amount: number, feeApplied: boolean) {
  const cleanAmount = Math.max(0, Math.floor(amount || 0))
  return feeApplied ? Math.floor(cleanAmount * 0.95) : cleanAmount
}
