import { create } from 'zustand'

/** Demo helper: lets a logged-in Staff session view any staff member's work until real per-user login exists in the backend. */
const KEY = 'tf-view-as'
export const useViewAs = create<{ staffId: string }>(() => ({ staffId: (() => { try { return localStorage.getItem(KEY) || '' } catch { return '' } })() }))
export const setViewAs = (staffId: string) => { useViewAs.setState({ staffId }); try { localStorage.setItem(KEY, staffId) } catch { /* ignore */ } }

/** Same idea for Office logins: pick which office's workspace to open. */
const OKEY = 'tf-view-office'
export const useViewOffice = create<{ officeId: string }>(() => ({ officeId: (() => { try { return localStorage.getItem(OKEY) || '' } catch { return '' } })() }))
export const setViewOffice = (officeId: string) => { useViewOffice.setState({ officeId }); try { localStorage.setItem(OKEY, officeId) } catch { /* ignore */ } }
/** The office employee a logged-in office user is acting as (their own record, or the office admin of the chosen office). */
export function hostIdFor(u: { role: string; refId: string } | null | undefined, hosts: { id: string; officeId: string; designation: string }[]): string {
  if (!u) return ''
  const o = useViewOffice.getState().officeId
  if (!u.role.startsWith('OFFICE') || !o) return u.refId
  const inOffice = hosts.filter((h) => h.officeId === o)
  return (inOffice.find((h) => /admin/i.test(h.designation)) ?? inOffice[0])?.id ?? u.refId
}
