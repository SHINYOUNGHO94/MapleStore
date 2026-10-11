import { useCallback, useEffect, useRef, useState } from 'react'
import { JOB_SITES, companyKey, searchCompanies, validSites, type JobApplication, type JobSite } from '../lib/jobApplications'
import { JobStoreError, loadJobApplications, saveJobApplication, mergeJobSites, deleteJobApplication } from '../lib/jobApplicationStore'
import { isSupabaseConfigured } from '../lib/supabase'
import type { T } from '../lib/i18n'

export default function JobApplicationsPanel({ t }: { t: T }) {
  const j = t.jobs
  const [entries, setEntries] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [sites, setSites] = useState<JobSite[]>([])
  const [appliedOn, setAppliedOn] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<JobApplication>()
  const [raceDuplicate, setRaceDuplicate] = useState<JobApplication>()
  const request = useRef(0)
  const errorText = useCallback((e: unknown) => e instanceof JobStoreError ? j[e.code === 'duplicate' ? 'duplicate' : e.code] : j.request, [j])
  const refresh = useCallback(async () => {
    const current = ++request.current
    try {
      const data = await loadJobApplications()
      if (current !== request.current) return
      setEntries(data); setError(''); setReady(true)
    } catch (e) {
      if (current === request.current) setError(errorText(e))
    } finally { if (current === request.current) setLoading(false) }
  }, [errorText])
  useEffect(() => {
    const requestState = request
    void refresh()
    const onFocus = () => { if (document.visibilityState === 'visible') void refresh() }
    const interval = window.setInterval(onFocus, 30000)
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onFocus)
    return () => { requestState.current++; window.clearInterval(interval); window.removeEventListener('focus', onFocus); window.removeEventListener('storage', onFocus) }
  }, [refresh])
  const duplicate = raceDuplicate ?? entries.find(entry => entry.company_key === companyKey(name) && entry.id !== editing?.id)
  const visible = searchCompanies(entries, query)
  function reset() { setName(''); setSites([]); setAppliedOn(''); setEditing(undefined); setRaceDuplicate(undefined) }
  async function act(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(''); setNotice('')
    try { await action(); reset(); setNotice(success); await refresh() }
    catch (e) { setError(errorText(e)); if (e instanceof JobStoreError && e.existing) setRaceDuplicate(e.existing) }
    finally { setBusy(false) }
  }
  function edit(entry: JobApplication) { setEditing(entry); setName(entry.company_name); setSites([...entry.sites]); setAppliedOn(entry.applied_on ?? ''); setRaceDuplicate(undefined); setNotice('') }
  return <div className="screen-stack jobs-panel">
    <section className="ipch-panel">
      <div className="jobs-heading"><div><h2>{j.title}</h2><p>{j.intro}</p><small>{isSupabaseConfigured ? j.shared : j.local}</small></div><button type="button" className="secondary-button" disabled={busy} onClick={() => void refresh()}>{j.refresh}</button></div>
      {error && <p className="status-line error" role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <form onSubmit={event => { event.preventDefault(); if (!duplicate) void act(() => saveJobApplication(name, sites, editing, appliedOn), j.saved) }}>
        <fieldset disabled={busy || !ready} className="jobs-fields">
          <label className="field"><span>{j.company}</span><input required maxLength={200} value={name} onChange={event => { setName(event.target.value); setRaceDuplicate(undefined) }} /></label>
          <fieldset className="jobs-sites"><legend>{j.sites}</legend>{JOB_SITES.map(site => <label key={site}><input type="checkbox" checked={sites.includes(site)} onChange={event => setSites(previous => event.target.checked ? validSites([...previous, site]) : previous.filter(value => value !== site))} />{site}</label>)}</fieldset>
          <label className="field"><span>{j.appliedDate}</span><input type="date" value={appliedOn} onChange={event => setAppliedOn(event.target.value)} /><small>{j.appliedDateHint}</small></label>
          {editing && <small>{j.added}: <time dateTime={editing.added_on}>{editing.added_on}</time></small>}
          {duplicate && <div className="jobs-duplicate" role="status"><strong>{j.duplicate}</strong><p>{duplicate.company_name} · {j.added}: {duplicate.added_on}</p><p>{duplicate.sites.join(' · ')}</p>
            {editing ? <button type="button" className="secondary-button" onClick={() => edit(duplicate)}>{j.openExisting}</button> : <button type="button" className="secondary-button" disabled={!sites.length} onClick={() => void act(() => mergeJobSites(duplicate.id, sites), j.saved)}>{j.merge}</button>}
          </div>}
          <div className="jobs-actions"><button className="primary-button" type="submit" disabled={!name.trim() || !sites.length || Boolean(duplicate)}>{busy ? j.busy : editing ? j.save : j.add}</button>{(editing || duplicate) && <button type="button" className="secondary-button" onClick={reset}>{j.cancel}</button>}</div>
        </fieldset>
      </form>
    </section>
    <section className="ipch-panel">
      <label className="field"><span>{j.search}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <p aria-live="polite">{visible.length} {j.count}</p>
      {loading ? <p>{j.loading}</p> : ready && visible.length === 0 ? <p className="empty-state">{query.trim() ? j.noResults : j.empty}</p> : null}
      <ul className="jobs-list">{visible.map(entry => <li key={entry.id}><div><h3>{entry.company_name}</h3><small>{j.added}: <time dateTime={entry.added_on}>{entry.added_on}</time> · {j.appliedDate}: {entry.applied_on ? <time dateTime={entry.applied_on}>{entry.applied_on}</time> : j.appliedDateUnknown}</small><div className="jobs-badges">{entry.sites.map(site => <span key={site}>{site}</span>)}</div></div><div className="jobs-actions"><button type="button" className="secondary-button" disabled={busy} onClick={() => edit(entry)}>{j.edit}</button><button type="button" className="secondary-button danger" disabled={busy} onClick={() => { if (window.confirm(`${entry.company_name}\n${j.confirmDelete}`)) void act(() => deleteJobApplication(entry), j.deleted) }}>{j.remove}</button></div></li>)}</ul>
    </section>
  </div>
}
