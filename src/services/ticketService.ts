import { db, currentUser } from '@/store/db'
import type { Ticket, Comment } from '@/types'
import { auditLog, notify, sendMessage, nowIso, tpl, nextCode } from './core'
import * as taskService from './taskService'
import { TICKET_TO_STAFF } from '@/utils/constants'
import { uid } from '@/utils/helpers'

const get = (id: string) => db().tickets.find((t) => t.id === id)!
const SLA = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 }
export type NewTicket = Pick<Ticket, 'subject' | 'description' | 'category' | 'priority' | 'towerId' | 'floorId' | 'officeId' | 'preferredVisit'> & { attachments?: string[] }
export function create(d: NewTicket) {
  const s = db(), u = currentUser()
  const reporter = s.officeEmployees.find((h) => h.id === u?.refId) ?? s.officeEmployees.find((h) => h.officeId === d.officeId)
  const off = s.offices.find((x) => x.id === d.officeId), needsOwner = !!u && u.role.startsWith('OFFICE') && !!off?.ownerName && s.users.some((x) => x.role === 'OWNER' && x.refId === off.ownerName)
  const t: Ticket = { id: uid('tkt'), code: nextCode('TK', s.tickets, 1001), status: needsOwner ? 'PENDING_OWNER' : 'OPEN', reporterId: reporter?.id ?? '', assignedEmployeeId: '', attachments: [], createdAt: nowIso(), dueAt: new Date(Date.now() + SLA[d.priority] * 3600000).toISOString(), rating: null, taskId: '', comments: [{ id: uid('c'), by: reporter?.name ?? 'Office', kind: 'office', text: d.description, at: nowIso() }], timeline: [{ at: nowIso(), label: needsOwner ? `Raised by ${reporter?.name ?? 'Office'} — awaiting owner approval` : 'Ticket raised' }], ...d }
  s.add('tickets', t)
  if (needsOwner) notify({ category: 'Ticket', title: 'Ticket needs your approval', body: `${t.code}: ${d.subject} (Office ${off?.number}) — ${d.priority}`, link: `/tickets/${t.id}`, roles: ['OWNER'], officeId: d.officeId })
  else notify({ category: 'Ticket', title: 'New ticket raised', body: `${t.code}: ${d.subject} (Office ${off?.number}) — ${d.priority}`, link: `/tickets/${t.id}`, roles: ['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'] })
  auditLog(`raised ticket ${t.code}`, 'Tickets', t.code); s.toast('Ticket created successfully.')
  return t
}
export function ownerApprove(id: string) {
  const t = get(id), u = currentUser(), s = db(), o = s.offices.find((x) => x.id === t.officeId)
  s.patch('tickets', id, { status: 'OPEN', timeline: [...t.timeline, { at: nowIso(), label: `Approved by owner ${u?.name ?? ''} — sent to admin` }] })
  notify({ category: 'Ticket', title: 'Owner-approved ticket', body: `${t.code}: ${t.subject} (Office ${o?.number}) — ${t.priority}`, link: `/tickets/${t.id}`, roles: ['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'] })
  notify({ category: 'Ticket', title: 'Ticket approved by owner', body: `${t.code} was approved and sent to the service desk.`, link: `/tickets/${t.id}`, roles: ['OFFICE_ADMIN', 'OFFICE_EMPLOYEE'], officeId: t.officeId })
  auditLog(`owner approved ticket ${t.code}`, 'Tickets', t.code); s.toast('Ticket approved and sent to admin.')
}
export function ownerReject(id: string, reason?: string) {
  const t = get(id), u = currentUser(), s = db()
  s.patch('tickets', id, { status: 'OWNER_REJECTED', timeline: [...t.timeline, { at: nowIso(), label: `Declined by owner ${u?.name ?? ''}${reason ? ` — ${reason}` : ''}` }] })
  notify({ category: 'Ticket', title: 'Ticket declined by owner', body: `${t.code}: ${t.subject}${reason ? ` — ${reason}` : ''}`, link: `/tickets/${t.id}`, roles: ['OFFICE_ADMIN', 'OFFICE_EMPLOYEE'], officeId: t.officeId })
  auditLog(`owner declined ticket ${t.code}`, 'Tickets', t.code); s.toast('Ticket declined.', 'info')
}
export function assign(id: string, empId: string) {
  const t = get(id), s = db(), emp = s.employees.find((e) => e.id === empId)!
  const task = taskService.create({ title: t.subject, description: t.description, category: TICKET_TO_STAFF[t.category] ?? 'Other', towerId: t.towerId, floorId: t.floorId, officeId: t.officeId, priority: t.priority, assignedEmployeeId: empId, deadline: t.dueAt, ticketId: t.id })
  s.patch('tickets', id, { status: 'ASSIGNED', assignedEmployeeId: empId, taskId: task.id, timeline: [...t.timeline, { at: nowIso(), label: `Assigned to ${emp.name}` }] })
  const msg = tpl('New maintenance ticket #{{ticket}} has been assigned to you. Priority: {{priority}}.', { ticket: t.code, priority: t.priority })
  sendMessage({ channel: 'whatsapp', recipient: emp.name, contact: emp.phone, subject: '', message: msg, type: 'Ticket assignment', related: t.id, relatedLabel: t.code })
  auditLog(`assigned Ticket #${t.code} to ${emp.name}`, 'Tickets', t.code); s.toast(`Ticket assigned to ${emp.name.split(' ')[0]}.`)
}
export function confirmClose(id: string, rating: number) {
  const t = get(id)
  db().patch('tickets', id, { status: 'CLOSED', rating, timeline: [...t.timeline, { at: nowIso(), label: 'Office confirmed resolution — ticket closed' }] })
  auditLog(`closed ticket ${t.code}`, 'Tickets', t.code); db().toast('Ticket closed.')
}
export function reopen(id: string) { const t = get(id); db().patch('tickets', id, { status: 'OPEN', timeline: [...t.timeline, { at: nowIso(), label: 'Ticket reopened' }] }) }
export function setStatus(id: string, status: Ticket['status']) { const t = get(id); db().patch('tickets', id, { status, timeline: [...t.timeline, { at: nowIso(), label: `Status changed to ${status.replace('_', ' ')}` }] }); db().toast('Ticket updated.') }
export function addComment(id: string, text: string, kind: Comment['kind']) {
  const t = get(id)
  db().patch('tickets', id, { comments: [...t.comments, { id: uid('c'), by: currentUser()?.name ?? 'User', kind, text, at: nowIso() }] })
}
