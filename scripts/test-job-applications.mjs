import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import ts from 'typescript'
const compile = text => ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const url = text => `data:text/javascript;base64,${Buffer.from(text).toString('base64')}`
const modelUrl = url(compile(await fs.readFile(new URL('../src/lib/jobApplications.ts', import.meta.url), 'utf8')))
const model = await import(modelUrl)
const source = compile(await fs.readFile(new URL('../src/lib/jobApplicationStore.ts', import.meta.url), 'utf8')).replace("'./jobApplications'", JSON.stringify(modelUrl))
Object.defineProperty(globalThis, 'navigator', { value: { locks: { request: async (_name, callback) => callback() } }, configurable: true })
const memory = new Map()
globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) }, crypto: globalThis.crypto }
const local = await import(url(source.replace("import { supabase } from './supabase';", 'const supabase = null;')))
const a = await local.saveJobApplication('  Example   COMPANY  ', ['Green'])
assert.equal(a.company_name, 'Example COMPANY')
assert.equal(a.added_on, model.localDate())
await assert.rejects(() => local.saveJobApplication('example company', ['paiza']), e => e.code === 'duplicate' && e.existing.id === a.id)
await local.mergeJobSites(a.id, ['paiza', 'Green'])
const merged = (await local.loadJobApplications())[0]
assert.deepEqual(merged.sites, ['Green', 'paiza'])
assert.equal(merged.added_on, a.added_on)
assert.equal(merged.created_at, a.created_at)
await assert.rejects(() => local.saveJobApplication('Renamed', ['Green'], a), e => e.code === 'conflict')
await assert.rejects(() => local.deleteJobApplication(a), e => e.code === 'conflict')
const b = await local.saveJobApplication('Second', ['OpenWork'])
await assert.rejects(() => local.saveJobApplication('SECOND', ['paiza'], merged), e => e.code === 'duplicate')
const updated = await local.saveJobApplication('Example Revised', ['Findy-code'], merged)
assert.equal(updated.added_on, a.added_on)
assert.equal(model.searchCompanies([updated, b], 'EXAMPLE rev').length, 1)
assert.equal(model.searchCompanies([updated, b], 'missing').length, 0)
assert.equal(model.localDate(new Date(2026, 9, 11, 0, 5)), '2026-10-11')
await assert.rejects(() => local.saveJobApplication(' ', ['Green']), e => e.code === 'invalid')
await assert.rejects(() => local.saveJobApplication('Empty', []), e => e.code === 'invalid')
await local.deleteJobApplication(updated)
assert.deepEqual((await local.loadJobApplications()).map(e => e.id), [b.id])
memory.set('maplestore-job-applications', '{broken')
await assert.rejects(() => local.loadJobApplications(), e => e.code === 'storage')
assert.equal(memory.get('maplestore-job-applications'), '{broken')

// Supabase branch: no local fallback, version guard, atomic merge RPC.
let result = { data: null, error: { code: 'PGRST205' } }
let calls = []
const chain = new Proxy({}, { get: (_, key) => {
  if (key === 'then') return (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  return (...args) => { calls.push([key, ...args]); return chain }
} })
globalThis.__jobTestDb = { from: name => { calls.push(['from', name]); return chain }, rpc: (...args) => { calls.push(['rpc', ...args]); return chain } }
const remote = await import(url(source.replace("import { supabase } from './supabase';", 'const supabase = globalThis.__jobTestDb;')))
await assert.rejects(() => remote.loadJobApplications(), e => e.code === 'setup')
result = { data: updated, error: null }; calls = []
await remote.saveJobApplication('Example Revised', ['Green'], updated)
assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'version' && call[2] === updated.version))
assert.ok(calls.some(call => call[0] === 'update' && !('added_on' in call[1])))
calls = []
await remote.mergeJobSites(updated.id, ['paiza'])
assert.deepEqual(calls[0], ['rpc', 'merge_job_application_sites', { target_id: updated.id, new_sites: ['paiza'] }])
result = { data: null, error: null }
await assert.rejects(() => remote.deleteJobApplication(updated), e => e.code === 'conflict')
console.log('PASS: CRUD, duplicate/merge, search, local date, unchanged registration date, conflict protection, corrupted storage, Supabase routing/RPC/errors')
