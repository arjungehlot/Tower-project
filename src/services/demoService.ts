import { db } from '@/store/db'
import * as vs from './visitorService'
import * as ts from './ticketService'
import * as tk from './taskService'
import { notify } from './core'
import { recommend } from './employeeService'
import { TICKET_TO_STAFF } from '@/utils/constants'

// Deterministic, user-triggered demo actions — nothing mutates data on its own.
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
export const demo = {
  registerVisitor() {
    const s = db(), o = pick(s.offices.filter((x) => x.tenantId)), host = s.officeEmployees.find((h) => h.officeId === o.id)!
    const names = ['Rohan Malhotra', 'Simran Kaur', 'Aditya Rao', 'Pallavi Desai', 'Karthik Menon']
    vs.register({ name: pick(names), mobile: '98' + Math.floor(10000000 + Math.random() * 89999999), email: '', photo: '', idType: 'Aadhaar', idNumber: '4521XXXX', purpose: pick(['Meeting', 'Interview', 'Delivery']), towerId: o.towerId, floorId: o.floorId, officeId: o.id, hostId: host.id, expectedDuration: '1 hour', count: 1 })
  },
  approveVisitor() { const v = db().visitors.find((x) => x.status === 'PENDING'); v ? vs.approve(v.id) : db().toast('No pending visitors', 'info') },
  simulateEntry() { const v = db().visitors.find((x) => x.status === 'APPROVED'); v ? vs.allowEntry(v.id) : db().toast('No approved visitors waiting', 'info') },
  simulateExit() { const v = db().visitors.filter((x) => x.status === 'INSIDE').sort((a, b) => a.entryAt.localeCompare(b.entryAt))[0]; v ? vs.markExit(v.id) : db().toast('Nobody inside', 'info') },
  createTicket() {
    const o = pick(db().offices.filter((x) => x.tenantId))
    ts.create({ subject: pick(['Power socket sparking', 'AC not cooling', 'Washroom tap leaking']), description: 'Raised via demo control.', category: pick(['Electrical', 'HVAC', 'Plumbing']), priority: pick(['MEDIUM', 'HIGH', 'CRITICAL']) as never, towerId: o.towerId, floorId: o.floorId, officeId: o.id, preferredVisit: 'ASAP' })
  },
  assignTicket() {
    const t = db().tickets.find((x) => x.status === 'OPEN'); if (!t) return db().toast('No open tickets', 'info')
    const best = recommend(TICKET_TO_STAFF[t.category] ?? 'Maintenance')[0]; best ? ts.assign(t.id, best.id) : db().toast('No staff available', 'error')
  },
  completeTask() { const t = db().tasks.find((x) => x.status === 'IN_PROGRESS'); t ? tk.complete(t.id) : db().toast('No task in progress', 'info') },
  generateNotification() { notify({ category: pick(['System', 'Security', 'Payment']), title: 'Demo alert', body: 'This is a generated demo notification.' }); db().toast('Notification generated.', 'info') },
}
