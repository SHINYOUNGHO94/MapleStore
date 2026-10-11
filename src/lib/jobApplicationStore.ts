import { supabase } from './supabase'
import { cleanCompanyName, companyKey, localDate, validSites, type JobApplication, type JobSite } from './jobApplications'

const table = 'job_applications'
const localKey = 'maplestore-job-applications'
export class JobStoreError extends Error {
  code: 'duplicate' | 'conflict' | 'storage' | 'setup' | 'request' | 'invalid'
  existing?: JobApplication
  constructor(code: JobStoreError['code'], existing?: JobApplication) { super(code); this.code = code; this.existing = existing }
}
function fail(error: { code?: string }) {
  throw new JobStoreError(['42P01', 'PGRST205', 'PGRST202'].includes(error.code ?? '') ? 'setup' : 'request')
}
function readLocal(): JobApplication[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(localKey) ?? '[]')
    if (!Array.isArray(parsed) || parsed.some(e => !e || typeof e.company_name !== 'string' || !Array.isArray(e.sites))) throw new Error()
    return parsed
  } catch { throw new JobStoreError('storage') }
}
function writeLocal(entries: JobApplication[]) {
  try { window.localStorage.setItem(localKey, JSON.stringify(entries)) } catch { throw new JobStoreError('storage') }
}
async function localMutation<T>(fn: () => T): Promise<T> {
  return navigator.locks ? navigator.locks.request(localKey, fn) : fn()
}
export async function loadJobApplications(): Promise<JobApplication[]> {
  if (!supabase) return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at))
  const rows: JobApplication[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).order('id').range(offset, offset + 999)
    if (error) fail(error)
    rows.push(...(data ?? []))
    if ((data?.length ?? 0) < 1000) return rows
  }
}
export async function saveJobApplication(name: string, sites: JobSite[], existing?: JobApplication, appliedOn?: string) {
  const company_name = cleanCompanyName(name)
  const selected = validSites(sites)
  if (!company_name || company_name.length > 200 || !selected.length) throw new JobStoreError('invalid')
  const draft = { company_name, sites: selected, ...(appliedOn ? { applied_on: appliedOn } : {}) }
  if (supabase) {
    const query = existing
      ? supabase.from(table).update(draft).eq('id', existing.id).eq('version', existing.version)
      : supabase.from(table).insert({ ...draft, added_on: localDate() })
    const { data, error } = await query.select().maybeSingle()
    if (error?.code === '23505') {
      const records = await loadJobApplications()
      throw new JobStoreError('duplicate', records.find(row => row.company_key === companyKey(name)))
    }
    if (error) fail(error)
    if (!data) throw new JobStoreError('conflict')
    return data as JobApplication
  }
  return localMutation(() => {
    const rows = readLocal()
    const duplicate = rows.find(row => row.company_key === companyKey(name) && row.id !== existing?.id)
    if (duplicate) throw new JobStoreError('duplicate', duplicate)
    if (existing && !rows.some(row => row.id === existing.id && row.version === existing.version)) throw new JobStoreError('conflict')
    const entry: JobApplication = { ...draft, applied_on: appliedOn ?? existing?.applied_on ?? null, company_key: companyKey(name), id: existing?.id ?? window.crypto.randomUUID(), added_on: existing?.added_on ?? localDate(), created_at: existing?.created_at ?? new Date().toISOString(), version: (existing?.version ?? 0) + 1 }
    writeLocal(existing ? rows.map(row => row.id === existing.id ? entry : row) : [entry, ...rows])
    return entry
  })
}
export async function mergeJobSites(id: string, sites: JobSite[]) {
  if (!validSites(sites).length) throw new JobStoreError('invalid')
  if (supabase) {
    const { data, error } = await supabase.rpc('merge_job_application_sites', { target_id: id, new_sites: validSites(sites) }).maybeSingle()
    if (error) fail(error)
    if (!data) throw new JobStoreError('conflict')
    return
  }
  await localMutation(() => {
    const rows = readLocal()
    const target = rows.find(row => row.id === id)
    if (!target) throw new JobStoreError('conflict')
    writeLocal(rows.map(row => row.id === id ? { ...row, sites: validSites([...row.sites, ...sites]), version: row.version + 1 } : row))
  })
}
export async function deleteJobApplication(entry: JobApplication) {
  if (supabase) {
    const { data, error } = await supabase.from(table).delete().eq('id', entry.id).eq('version', entry.version).select('id').maybeSingle()
    if (error) fail(error)
    if (!data) throw new JobStoreError('conflict')
    return
  }
  await localMutation(() => {
    const rows = readLocal()
    if (!rows.some(row => row.id === entry.id && row.version === entry.version)) throw new JobStoreError('conflict')
    writeLocal(rows.filter(row => row.id !== entry.id))
  })
}
