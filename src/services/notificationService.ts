import { hostIdFor } from '@/store/viewAs'
import { db } from '@/store/db'
import type { User, Notification } from '@/types'
export const visibleTo = (n: Notification, u: User | null) => {
  if (!u) return false
  if (n.userId) return n.userId === u.id
  if (n.officeId && !n.roles.includes('OWNER')) { const host = db().officeEmployees.find((h) => h.id === hostIdFor(u, db().officeEmployees)); if (host) return host.officeId === n.officeId }
  if (u.role === 'OWNER') return !!n.officeId && db().offices.some((o) => o.id === n.officeId && o.ownerName === u.refId) && n.roles.includes('OWNER')
  return n.roles.includes(u.role)
}
export const markRead = (id: string) => db().patch('notifications', id, { read: true })
export const markAllRead = (u: User | null) => db().notifications.filter((n) => visibleTo(n, u) && !n.read).forEach((n) => db().patch('notifications', n.id, { read: true }))
export { notify } from './core'
