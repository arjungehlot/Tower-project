import { db } from '@/store/db'
import type { User, Notification } from '@/types'
export const visibleTo = (n: Notification, u: User | null) => {
  if (!u) return false
  if (n.userId) return n.userId === u.id
  if (n.officeId) { const host = db().officeEmployees.find((h) => h.id === u.refId); if (host) return host.officeId === n.officeId }
  return n.roles.includes(u.role)
}
export const markRead = (id: string) => db().patch('notifications', id, { read: true })
export const markAllRead = (u: User | null) => db().notifications.filter((n) => visibleTo(n, u) && !n.read).forEach((n) => db().patch('notifications', n.id, { read: true }))
export { notify } from './core'
