import { hostIdFor } from '@/store/viewAs'
import { db, currentUser } from '@/store/db'
import type { Ticket, Comment } from '@/types'
import { auditLog, notify, sendMessage, nowIso, tpl, nextCode } from './core'
import * as taskService from './taskService'
import { refreshRating } from './employeeService'
import { TICKET_TO_STAFF } from '@/utils/constants'
import { uid } from '@/utils/helpers'

const get = (id: string) => db().tickets.find((t) => t.id === id)!
const SLA = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 }
export type NewTicket = Pick<Ticket, 'subject' | 'description' | 'category' | 'priority' | 'towerId' | 'floorId' | 'officeId' | 'preferredVisit'> & { attachments?: string[] }
export function create(d: NewTicket) {
  const s = db(), u = currentUser()
  const reporter = s.officeEmployees.find((h) => h.id === hostIdFor(u, s.officeEmployees)) ?? s.officeEmployees.find((h) => h.officeId === d.officeId)
  const off = s.offices.find((x) => x.id === d.officeId)
  const t: Ticket = { id: uid('tkt'), code: nextCode('TK', s.tickets, 1001), status: 'OPEN', reporterId: reporter?.id ?? '', assignedEmployeeId: '', attachments: [], createdAt: nowIso(), dueAt: new Date(Date.now() + SLA[d.priority] * 3600000).toISOString(), rating: null, taskId: '', comments: [{ id: uid('c'), by: reporter?.name ?? 'Office', kind: 'office', text: d.description, at: nowIso() }], timeline: [{ at: nowIso(), label: 'Ticket raised' }], ...d }
  s.add('tickets', t)
  notify({ category: 'Ticket', title: 'New ticket raised', body: `${t.code}: ${d.subject} (Office ${off?.number}) — ${d.priority}`, link: `/tickets/${t.id}`, roles: ['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'] })
  auditLog(`raised ticket ${t.code}`, 'Tickets', t.code); s.toast('Ticket created successfully.')
  return t
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
  const task = db().tasks.find((x) => x.id === t.taskId)
  if (task && !task.rating) { db().patch('tasks', task.id, { rating: { quality: rating, speed: rating, professionalism: rating, cleanliness: rating, overall: rating, comment: 'Rated by office on ticket confirmation' }, verifiedAt: nowIso(), verifiedBy: currentUser()?.refId || 'office', timeline: [...task.timeline, { at: nowIso(), label: `Office rated ${rating}/5` }] }); refreshRating(task.assignedEmployeeId) }
  auditLog(`closed ticket ${t.code}`, 'Tickets', t.code); db().toast('Ticket closed.')
}
export function reopen(id: string) { const t = get(id); db().patch('tickets', id, { status: 'OPEN', timeline: [...t.timeline, { at: nowIso(), label: 'Ticket reopened' }] }) }
export function setStatus(id: string, status: Ticket['status']) { const t = get(id); db().patch('tickets', id, { status, timeline: [...t.timeline, { at: nowIso(), label: `Status changed to ${status.replace('_', ' ')}` }] }); db().toast('Ticket updated.') }
export function addComment(id: string, text: string, kind: Comment['kind']) {
  const t = get(id)
  db().patch('tickets', id, { comments: [...t.comments, { id: uid('c'), by: currentUser()?.name ?? 'User', kind, text, at: nowIso() }] })
}
