import { db, currentUser } from '@/store/db'
import type { Visitor } from '@/types'
import { auditLog, notify, sendMessage, nowIso, tpl } from './core'
import { uid } from '@/utils/helpers'

const tl = (v: Visitor, label: string) => [...v.timeline, { at: nowIso(), label }]
export const get = (id: string) => db().visitors.find((v) => v.id === id)!
const officeNo = (id: string) => db().offices.find((o) => o.id === id)?.number ?? ''

export type NewVisitor = Pick<Visitor, 'name' | 'mobile' | 'email' | 'photo' | 'idType' | 'idNumber' | 'purpose' | 'towerId' | 'floorId' | 'officeId' | 'hostId' | 'expectedDuration' | 'count'>
export function register(d: NewVisitor, gate = 'Gate 1') {
  const u = currentUser(), s = db(), host = s.officeEmployees.find((h) => h.id === d.hostId)!
  const v: Visitor = { ...d, id: uid('vs'), status: 'PENDING', guardId: u?.id ?? '', gate, requestedAt: nowIso(), approvedAt: '', entryAt: '', exitAt: '', remark: '', timeline: [{ at: nowIso(), label: 'Visitor registered' }, { at: nowIso(), label: 'Approval request sent' }] }
  s.add('visitors', v)
  const cfg = s.settings[0].whatsapp.templates.visitor
  const msg = tpl(cfg, { visitorName: d.name, gate, office: `Office ${officeNo(d.officeId)}` })
  sendMessage({ channel: 'whatsapp', recipient: host.name, contact: host.phone, subject: '', message: msg, type: 'Visitor approval', related: v.id, relatedLabel: d.name })
  sendMessage({ channel: 'email', recipient: host.name, contact: host.email, subject: `Visitor waiting: ${d.name}`, message: msg, type: 'Visitor approval', related: v.id, relatedLabel: d.name })
  notify({ category: 'Visitor', title: 'Visitor waiting at ' + gate, body: msg, link: `/visitors/${v.id}`, roles: ['ADMIN', 'SUPER_ADMIN'], officeId: d.officeId })
  auditLog(`registered visitor ${d.name}`, 'Visitors', d.name)
  s.toast('Visitor registered. Approval request sent.')
  return v
}
export function approve(id: string) {
  const v = get(id), by = currentUser()?.name ?? 'Host'
  db().patch('visitors', id, { status: 'APPROVED', approvedAt: nowIso(), timeline: [...tl(v, `Host approved (${by})`), { at: nowIso(), label: 'Guard notified' }] })
  notify({ category: 'Visitor', title: 'Visitor approved', body: `${v.name} approved for Office ${officeNo(v.officeId)}. Allow entry.`, link: `/visitors/${id}`, roles: ['SECURITY_GUARD', 'ADMIN', 'SUPER_ADMIN'] })
  auditLog(`approved visitor ${v.name}`, 'Visitors', v.name); db().toast(`${v.name} approved.`)
}
export function reject(id: string, reason = 'Rejected by host') {
  const v = get(id)
  db().patch('visitors', id, { status: 'REJECTED', remark: reason, timeline: tl(v, `Host rejected: ${reason}`) })
  notify({ category: 'Visitor', title: 'Visitor rejected', body: `${v.name} was rejected. Do not allow entry.`, link: `/visitors/${id}`, roles: ['SECURITY_GUARD', 'ADMIN', 'SUPER_ADMIN'] })
  auditLog(`rejected visitor ${v.name}`, 'Visitors', v.name); db().toast(`${v.name} rejected.`, 'info')
}
export function requestInfo(id: string, msg = 'Please share more details about the visit') {
  const v = get(id)
  db().patch('visitors', id, { status: 'INFO_REQUESTED', remark: msg, timeline: tl(v, `More information requested: ${msg}`) })
  notify({ category: 'Approval', title: 'More info requested', body: `${v.name}: ${msg}`, link: `/visitors/${id}`, roles: ['SECURITY_GUARD'] })
  db().toast('Information requested from guard.', 'info')
}
export function resubmit(id: string) { const v = get(id); db().patch('visitors', id, { status: 'PENDING', timeline: tl(v, 'Guard provided information — request re-sent') }) }
export function allowEntry(id: string) {
  const v = get(id), g = currentUser()
  db().patch('visitors', id, { status: 'INSIDE', entryAt: nowIso(), guardId: g?.id ?? v.guardId, timeline: tl(v, 'Visitor entered building') })
  auditLog(`allowed entry for ${v.name}`, 'Visitors', v.name); db().toast(`${v.name} is now inside.`)
}
export function markExit(id: string) {
  const v = get(id)
  db().patch('visitors', id, { status: 'EXITED', exitAt: nowIso(), timeline: tl(v, 'Visitor exited building') })
  auditLog(`marked exit for ${v.name}`, 'Visitors', v.name); db().toast(`${v.name} exited.`, 'info')
}
