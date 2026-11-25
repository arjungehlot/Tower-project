import { db } from '@/store/db'
import type { Employee, Task } from '@/types'
import { avg } from '@/utils/helpers'
import { STAFF_TO_TICKET } from '@/utils/constants'

const ACTIVE = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD']
export const activeTasks = (empId: string, tasks: Task[] = db().tasks) => tasks.filter((t) => t.assignedEmployeeId === empId && ACTIVE.includes(t.status))
export function refreshStatus(empId: string) {
  const e = db().employees.find((x) => x.id === empId); if (!e || ['OFF_DUTY', 'ABSENT', 'ON_BREAK'].includes(e.status)) return
  const busy = db().tasks.some((t) => t.assignedEmployeeId === empId && ['ACCEPTED', 'IN_PROGRESS'].includes(t.status))
  db().patch('employees', empId, { status: busy ? 'BUSY' : 'AVAILABLE' })
}
export function refreshRating(empId: string) {
  const r = db().tasks.filter((t) => t.assignedEmployeeId === empId && t.rating).map((t) => t.rating!.overall)
  if (r.length) db().patch('employees', empId, { rating: avg(r) })
}
const RANK: Record<string, number> = { AVAILABLE: 0, BUSY: 1, ON_BREAK: 2, OFF_DUTY: 3, ABSENT: 4 }
/** Smart assignment: availability → location → workload → skill → rating */
export function recommend(category: string, towerName = '', ticketCategory = ''): (Employee & { load: number; reason: string })[] {
  const list = db().employees.filter((e) => e.role === 'staff' && e.category === category)
  return list.map((e) => ({ ...e, load: activeTasks(e.id).length, reason: '' })).sort((a, b) =>
    RANK[a.status] - RANK[b.status] ||
    Number(b.location === towerName) - Number(a.location === towerName) ||
    a.load - b.load ||
    Number(b.skills.some((s) => ticketCategory && s.toLowerCase().includes(ticketCategory.toLowerCase()))) - Number(a.skills.some((s) => ticketCategory && s.toLowerCase().includes(ticketCategory.toLowerCase()))) ||
    b.rating - a.rating)
}
export const categoryForTicket = (c: string) => Object.entries(STAFF_TO_TICKET).find(([, v]) => v === c)?.[0]
