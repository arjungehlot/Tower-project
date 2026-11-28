import { create } from 'zustand'

/** Remembers when each sidebar page was last opened, so its "new today" badge clears after a visit. */
const KEY = 'tf-seen'
const load = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
export const useSeen = create<{ at: Record<string, number> }>(() => ({ at: load() }))
export const markSeen = (path: string) => {
  const at = { ...useSeen.getState().at, [path]: Date.now() }
  useSeen.setState({ at }); try { localStorage.setItem(KEY, JSON.stringify(at)) } catch { /* ignore */ }
}
