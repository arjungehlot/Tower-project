import { create } from 'zustand'

/** Tracks records created in this browser so lists can flag them with a "NEW" tag for a while. */
const KEY = 'tf-new', TTL = 15 * 60 * 1000
const load = (): Record<string, number> => { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, number>, now = Date.now(); return Object.fromEntries(Object.entries(o).filter(([, t]) => now - t < TTL)) } catch { return {} } }
export const useRecent = create<{ ids: Record<string, number> }>(() => ({ ids: load() }))
export const markNew = (id?: string) => {
  if (!id) return
  const now = Date.now(), ids = Object.fromEntries(Object.entries({ ...useRecent.getState().ids, [id]: now }).filter(([, t]) => now - t < TTL))
  useRecent.setState({ ids }); try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* ignore */ }
}
export const isNew = (ids: Record<string, number>, id?: string) => !!id && !!ids[id] && Date.now() - ids[id] < TTL
