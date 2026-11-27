import { markNew } from './recent'
import { create } from 'zustand'
import type { Db, Coll, Role, User } from '@/types'
import { storage } from '@/services/storageService'
import { uid } from '@/utils/helpers'
import buildings from '@/data/buildings.json'
import towers from '@/data/towers.json'
import floors from '@/data/floors.json'
import offices from '@/data/offices.json'
import tenants from '@/data/tenants.json'
import employees from '@/data/employees.json'
import officeEmployees from '@/data/officeEmployees.json'
import visitors from '@/data/visitors.json'
import tickets from '@/data/tickets.json'
import tasks from '@/data/tasks.json'
import notifications from '@/data/notifications.json'
import messages from '@/data/messages.json'
import auditLogs from '@/data/auditLogs.json'
import assets from '@/data/assets.json'
import maintenance from '@/data/maintenance.json'
import documents from '@/data/documents.json'
import users from '@/data/users.json'
import roles from '@/data/roles.json'
import settings from '@/data/settings.json'

const SEED = { buildings, towers, floors, offices, tenants, employees, officeEmployees, visitors, tickets, tasks, notifications, messages, auditLogs, assets, maintenance, documents, users, roles, settings } as unknown as Db
export const COLLS = Object.keys(SEED) as Coll[]
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

// Seed timestamps are relative to generation time; shift them so "today" is today on first run.
function shift<T>(v: T, delta: number): T {
  if (typeof v === 'string') return (ISO.test(v) ? new Date(new Date(v).getTime() + delta).toISOString() : v) as unknown as T
  if (Array.isArray(v)) return v.map((x) => shift(x, delta)) as unknown as T
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shift(x, delta)])) as T
  return v
}
function loadDb(): Db {
  let delta = storage.get<number>('seedDelta')
  if (delta == null) { delta = Date.now() - new Date((SEED.settings[0] as { seedAt: string }).seedAt).getTime(); storage.set('seedDelta', delta) }
  const db: Record<string, unknown> = {}
  for (const k of COLLS) {
    const stored = storage.get(k)
    if (stored) db[k] = stored
    else { db[k] = k === 'settings' ? SEED[k] : shift(SEED[k], delta!); storage.set(k, db[k]) }
  }
  return db as unknown as Db
}

export interface Toast { id: string; kind: 'success' | 'error' | 'info'; msg: string }
interface State extends Db {
  userId: string | null
  theme: 'light' | 'dark'
  towerFilter: string
  demoMode: boolean
  toasts: Toast[]
  add: <C extends Coll>(c: C, item: Db[C][number]) => void
  patch: <C extends Coll>(c: C, id: string, p: Partial<Db[C][number]>) => void
  remove: (c: Coll, id: string) => void
  setAll: <C extends Coll>(c: C, items: Db[C]) => void
  login: (email: string, password: string) => User | null
  loginAs: (role: Role) => void
  logout: () => void
  setTheme: (t: 'light' | 'dark') => void
  setTowerFilter: (id: string) => void
  setDemo: (b: boolean) => void
  toast: (msg: string, kind?: Toast['kind']) => void
  dismissToast: (id: string) => void
  resetData: () => void
}
const applyTheme = (t: string) => document.documentElement.classList.toggle('dark', t === 'dark')
const theme0 = (storage.get<string>('theme') as 'light' | 'dark') || 'light'
applyTheme(theme0)

export const useDb = create<State>((set, get) => ({
  ...loadDb(),
  userId: storage.get<string>('session'),
  theme: theme0,
  towerFilter: 'all',
  demoMode: storage.get<boolean>('demo') ?? true,
  toasts: [],
  add: (c, item) => set((s) => { markNew((item as { id?: string }).id); const next = [item, ...(s[c] as unknown[])] as never; storage.set(c, next); return { [c]: next } as never }),
  patch: (c, id, p) => set((s) => { const next = (s[c] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...p } : x)) as never; storage.set(c, next); return { [c]: next } as never }),
  remove: (c, id) => set((s) => { const next = (s[c] as { id: string }[]).filter((x) => x.id !== id) as never; storage.set(c, next); return { [c]: next } as never }),
  setAll: (c, items) => { storage.set(c, items); set({ [c]: items } as never) },
  login: (email, password) => {
    const u = get().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
    if (u) { storage.set('session', u.id); set({ userId: u.id }) }
    return u ?? null
  },
  loginAs: (role) => { const u = get().users.find((x) => x.role === role); if (u) { storage.set('session', u.id); set({ userId: u.id }) } },
  logout: () => { storage.delete('session'); set({ userId: null }) },
  setTheme: (t) => { storage.set('theme', t); applyTheme(t); set({ theme: t }) },
  setTowerFilter: (id) => set({ towerFilter: id }),
  setDemo: (b) => { storage.set('demo', b); set({ demoMode: b }) },
  toast: (msg, kind = 'success') => { const id = uid('t'); set((s) => ({ toasts: [...s.toasts, { id, kind, msg }] })); setTimeout(() => get().dismissToast(id), 3500) },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  resetData: () => { storage.clear(); location.reload() },
}))

export const db = () => useDb.getState()
export const currentUser = () => { const s = db(); return s.users.find((u) => u.id === s.userId) ?? null }
