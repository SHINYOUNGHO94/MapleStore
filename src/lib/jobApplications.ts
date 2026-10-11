export const JOB_SITES = ['Green', 'OpenWork', 'Findy-code', 'paiza'] as const
export type JobSite = typeof JOB_SITES[number]
export type JobApplication = {
  id: string
  company_name: string
  company_key: string
  sites: JobSite[]
  added_on: string
  applied_on?: string | null
  created_at: string
  version: number
}
export function cleanCompanyName(name: string) { return name.trim().replace(/\s+/g, ' ') }
export function companyKey(name: string) { return cleanCompanyName(name).toLowerCase() }
export function searchCompanies(entries: JobApplication[], query: string) {
  const key = companyKey(query)
  return entries.filter(entry => companyKey(entry.company_name).includes(key))
}
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function validSites(sites: JobSite[]) { return JOB_SITES.filter(site => sites.includes(site)) }
