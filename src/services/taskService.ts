import { db, currentUser } from '@/store/db'
import type { Task, Rating, TaskStatus } from '@/types'
import { auditLog, notify, sendMessage, nowIso, tpl, nextCode } from './core'
import { refreshStatus, refreshRating } from './employeeService'
import { uid } from '@/utils/helpers'

const get = (id: string) => db().tasks.find((t) => t.id === id)!
const tl = (t: Task, label: string) => [...t.timeline, { at: nowIso(), label }]
const empName = (id: string) => db().employees.find((e) => e.id === id)?.name ?? 'Unassigned'

export type NewTask = Pick<Task, 'title' | 'description' | 'category' | 'towerId' | 'floorId' | 'officeId' | 'priority' | 'assignedEmployeeId' | 'deadline'> & Partial<Pick<Task, 'notes' | 'ticketId' | 'attachments'>>
export function create(d: NewTask) {
  const s = db(), emp = s.employees.find((e) => e.id === d.assignedEmployeeId)
  const t: Task = { id: uid('tk'), code: nextCode('TASK', s.tasks, 101), locationNote: '', supervisorId: emp?.supervisorId ?? '', createdBy: currentUser()?.id ?? 'system', createdAt: nowIso(), status: 'ASSIGNED', progress: 0, startedAt: '', completedAt: '', verifiedAt: '', verifiedBy: '', rating: null, proof: '', notes: '', ticketId: '', comments: [], attachments: [], ...d, timeline: [{ at: nowIso(), label: 'Task created' }, ...(emp ? [{ at: nowIso(), label: `Assigned to ${emp.name}` }] : [])] }
  s.add('tasks', t)
  if (emp) {
    const loc = s.offices.find((o) => o.id === d.officeId)
    const msg = tpl(s.settings[0].whatsapp.templates.task, { task: `${d.title}${loc ? ` — Office ${loc.number}` : ''}` })
    sendMessage({ channel: 'whatsapp', recipient: emp.name, contact: emp.phone, subject: '', message: msg, type: 'Work assignment', related: t.id, relatedLabel: t.code })
    const u = s.users.find((x) => x.refId === emp.id)
    notify({ category: 'Task', title: 'New task assigned', body: `${t.code}: ${d.title}`, link: `/tasks/${t.id}`, userId: u?.id ?? '', roles: ['SUPERVISOR'] })
  }
  auditLog(`created task ${t.code} (${d.title})`, 'Tasks', t.code); s.toast(emp ? `Task assigned to ${emp.name}.` : 'Task created.')
  return t
}
function setStatus(id: string, status: TaskStatus, label: string, extra: Partial<Task> = {}, ticketStatus?: 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'ASSIGNED') {
  const t = get(id)
  db().patch('tasks', id, { status, timeline: tl(t, label), ...extra })
  if (t.ticketId && ticketStatus) { const tk = db().tickets.find((x) => x.id === t.ticketId); if (tk) db().patch('tickets', tk.id, { status: ticketStatus, timeline: [...tk.timeline, { at: nowIso(), label }] }) }
  if (t.assignedEmployeeId) refreshStatus(t.assignedEmployeeId)
  auditLog(`${label} — ${t.code}`, 'Tasks', t.code)
  const sup = db().users.find((u) => u.refId === t.supervisorId)
  notify({ category: 'Task', title: `Task ${status.replace('_', ' ').toLowerCase()}`, body: `${t.code}: ${t.title} — ${label}`, link: `/tasks/${id}`, userId: sup?.id ?? '', roles: ['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'] })
}
export const accept = (id: string) => { setStatus(id, 'ACCEPTED', `Accepted by ${empName(get(id).assignedEmployeeId)}`); db().toast('Task accepted.') }
export const reject = (id: string) => { setStatus(id, 'REJECTED', 'Rejected by employee', {}, 'ASSIGNED'); db().toast('Task rejected.', 'info') }
export const start = (id: string) => { setStatus(id, 'IN_PROGRESS', 'Work started', { startedAt: nowIso(), progress: Math.max(get(id).progress, 10) }, 'IN_PROGRESS'); db().toast('Work started.') }
export const hold = (id: string) => { setStatus(id, 'ON_HOLD', 'Put on hold', {}, 'WAITING'); db().toast('Task on hold.', 'info') }
export const resume = (id: string) => { setStatus(id, 'IN_PROGRESS', 'Work resumed', {}, 'IN_PROGRESS') }
export const cancel = (id: string) => { setStatus(id, 'CANCELLED', 'Cancelled by admin'); db().toast('Task cancelled.', 'info') }
export const setProgress = (id: string, progress: number) => db().patch('tasks', id, { progress, timeline: tl(get(id), `Progress updated to ${progress}%`) })
export const complete = (id: string, proof = '') => { setStatus(id, 'COMPLETED', 'Work completed', { completedAt: nowIso(), progress: 100, proof }, 'RESOLVED'); db().toast('Task completed. Awaiting verification.') }
export function verifyAndRate(id: string, r: Omit<Rating, 'overall'> & { overall?: number }) {
  const t = get(id), u = currentUser()
  const overall = r.overall ?? Math.round(((r.quality + r.speed + r.professionalism + r.cleanliness) / 4) * 10) / 10
  db().patch('tasks', id, { verifiedAt: nowIso(), verifiedBy: u?.refId || u?.id || '', rating: { ...r, overall }, timeline: [...t.timeline, { at: nowIso(), label: 'Verified by supervisor' }, { at: nowIso(), label: `Rated ${overall}/5` }] })
  refreshRating(t.assignedEmployeeId)
  auditLog(`rated task ${t.code} ${overall}/5`, 'Tasks', t.code); db().toast('Employee rating saved.')
}
export function addComment(id: string, text: string, kind: 'admin' | 'staff' | 'office' | 'internal' = 'admin') {
  const t = get(id); db().patch('tasks', id, { comments: [...t.comments, { id: uid('c'), by: currentUser()?.name ?? 'User', kind, text, at: nowIso() }] })
}
