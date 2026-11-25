// Reusable localStorage service. Swap the implementation for REST calls later without touching callers.
const P = 'tower_'
export const storage = {
  key: (k: string) => P + k,
  get<T>(k: string, fallback: T | null = null): T | null {
    try { const v = localStorage.getItem(P + k); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
  },
  set<T>(k: string, v: T) { try { localStorage.setItem(P + k, JSON.stringify(v)) } catch (e) { console.warn('storage full', e) } },
  update<T>(k: string, fn: (v: T) => T, fallback: T) { const cur = (this.get<T>(k) ?? fallback) as T; this.set(k, fn(cur)) },
  delete(k: string) { localStorage.removeItem(P + k) },
  clear() { Object.keys(localStorage).filter((k) => k.startsWith(P)).forEach((k) => localStorage.removeItem(k)) },
}
