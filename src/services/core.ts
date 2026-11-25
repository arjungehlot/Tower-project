import { db, currentUser } from '@/store/db'
import { uid } from '@/utils/helpers'
import type { Role, MessageLog } from '@/types'

export const nowIso = () => new Date().toISOString()
export const auditLog = (action: string, module: string, entity: string) => {
  const u = currentUser()
  db().add('auditLogs', { id: uid('au'), user: u ? `${u.name} (${u.role.replace('_', ' ')})` : 'System', action, module, entity, timestamp: nowIso(), ip: '192.168.1.' + (20 + (u?.id.length ?? 0)), device: navigator.userAgent.includes('Mobile') ? 'Mobile browser' : 'Desktop browser' })
}
export function notify(n: { category: string; title: string; body: string; link?: string; userId?: string; roles?: Role[]; officeId?: string }) {
  if (!db().settings[0].notifications.inApp) return
  db().add('notifications', { id: uid('nt'), userId: n.userId ?? '', roles: n.roles ?? ['ADMIN', 'SUPER_ADMIN'], category: n.category, title: n.title, body: n.body, createdAt: nowIso(), read: false, link: n.link ?? '', officeId: n.officeId })
}
export function sendMessage(m: Omit<MessageLog, 'id' | 'sentAt' | 'status'> & { status?: MessageLog['status'] }) {
  const cfg = db().settings[0]
  if (m.channel === 'whatsapp' && !cfg.notifications.whatsapp) return
  if (m.channel === 'email' && !cfg.notifications.email) return
  const id = uid('ms')
  db().add('messages', { ...m, id, sentAt: nowIso(), status: m.status ?? 'SENT' })
  // simulated delivery receipts
  setTimeout(() => db().patch('messages', id, { status: 'DELIVERED' }), 1500)
  setTimeout(() => db().patch('messages', id, { status: 'READ' }), 5000)
}
export const tpl = (t: string, vars: Record<string, string>) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')
export const nextCode = (prefix: string, items: { code: string }[], start: number) => `${prefix}-${Math.max(start - 1, ...items.map((i) => parseInt(i.code.split('-')[1]) || 0)) + 1}`
