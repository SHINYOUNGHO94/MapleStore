import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'maplestore-merge-'))
try {
  for (const name of ['units', 'mapleServers', 'calculations']) {
    const source = await fs.readFile(new URL(`../src/lib/${name}.ts`, import.meta.url), 'utf8')
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
      .replace(/from '(\.\/[^']+)'/g, "from '$1.mjs'")
    await fs.writeFile(path.join(dir, `${name}.mjs`), js)
  }
  const { buildSummary } = await import(pathToFileURL(path.join(dir, 'calculations.mjs')))
  const worlds = await import(pathToFileURL(path.join(dir, 'mapleServers.mjs')))
  assert.deepEqual(worlds.MAPLE_SERVERS, ['scania'])
  const created_at = '2026-09-01T00:00:00Z'
  const entry = (server, entry_type, amount_meso) => ({ server, entry_type, amount_meso, account_id: 'aya', occurred_on: '2026-09-15', created_at })
  const entries = [entry('scania', 'boss_income', 1_000_000_000), entry('challengers', 'boss_income', 600_000_000), entry('challengers', 'boss_cost_girlfriend', 200_000_000), entry('scania', 'repay_girlfriend', 50_000_000), entry('challengers', 'withdraw_my_share', 100_000_000)]
  const transfers = [{ from_server: 'scania', to_server: 'challengers', oppa_amount_meso: 100_000_000, oppa_fee_meso: 1_000_000, oppa_received_meso: 99_000_000, created_at }, { from_server: 'challengers', to_server: 'scania', oppa_amount_meso: 200_000_000, oppa_fee_meso: 2_000_000, oppa_received_meso: 198_000_000, created_at }]
  const before = JSON.stringify({ entries, transfers })
  for (const filter of ['all', 'scania']) {
    const summary = buildSummary(entries, [], 4, transfers, filter)
    assert.equal(summary.myClaimByServer.scania, 1_447_000_000)
    assert.equal(summary.myClaimOnGirlfriendAccount, 1_447_000_000)
    assert.equal(summary.debtByServer.scania, 150_000_000)
    assert.equal(summary.bossIncomeByServer.scania, 1_600_000_000)
    assert.equal(summary.transferFeeByServer.scania, 3_000_000)
    assert.equal(summary.myClaimByServer.challengers, 0)
    assert.equal(summary.debtByServer.challengers, 0)
  }
  assert.equal(JSON.stringify({ entries, transfers }), before, 'source records remain intact')
  const js = await fs.readFile(path.join(dir, 'mapleServers.mjs'), 'utf8')
  await fs.writeFile(path.join(dir, 'reopened.mjs'), js.replace('CHALLENGERS_ENABLED = false', 'CHALLENGERS_ENABLED = true'))
  const reopened = await import(pathToFileURL(path.join(dir, 'reopened.mjs')))
  assert.equal(reopened.getEffectiveMapleServer('challengers', created_at), 'scania')
  assert.equal(reopened.getEffectiveMapleServer('challengers', '2027-01-01T00:00:00Z'), 'challengers')
  assert.equal(reopened.getEffectiveMapleServer('challengers'), 'scania')
  console.log('PASS: merged claims, debt, both transfer directions, fees, original records, and season reopening')
} finally {
  await fs.rm(dir, { recursive: true, force: true })
}
