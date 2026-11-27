import { useNavigate } from 'react-router-dom'
import { CrudPage } from '@/components/business/CrudPage'
import { StaffTile } from '@/components/business/StaffTile'
import { Avatar, Stars, Pill, Dash, Muted, type PillTone } from '@/components/ui'
import { useDb } from '@/store/db'
import { useEmployees } from '@/hooks/useEmployees'
import { activeTasks } from '@/services/employeeService'
import { STAFF_CATEGORIES, SHIFTS } from '@/utils/constants'
import { uid } from '@/utils/helpers'
import type { Employee } from '@/types'

const SS: Record<string, PillTone> = { AVAILABLE: 'ok', BUSY: 'info', ON_BREAK: 'warn', OFF_DUTY: 'muted', ABSENT: 'bad' }
const SL: Record<string, string> = { AVAILABLE: 'Available', BUSY: 'Busy', ON_BREAK: 'On break', OFF_DUTY: 'Off duty', ABSENT: 'Absent' }
const STATUSES = ['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY', 'ABSENT']
export default function StaffList({ supervisorsOnly }: { supervisorsOnly?: boolean }) {
  const nav = useNavigate(), { staff, supervisors } = useEmployees(), tasks = useDb((s) => s.tasks)
  const next = `EMP-${1000 + staff.length + supervisors.length + 1}`
  return <CrudPage<Employee> title={supervisorsOnly ? 'Supervisors' : 'Staff Management'} subtitle={supervisorsOnly ? 'Team leads who verify and rate work' : 'Registered service staff across all categories'} coll="employees" entity={supervisorsOnly ? 'Supervisor' : 'Staff'} rows={supervisorsOnly ? supervisors : staff}
    label={(e) => e.name} searchText={(e) => `${e.name} ${e.empId} ${e.category} ${e.phone}`} onRowClick={(e) => nav(`/staff/${e.id}`)}
    cards={(e, menu) => <StaffTile e={e} tasks={tasks} supervisor={supervisors.find((x) => x.id === e.supervisorId)} menu={menu} onClick={() => nav(`/staff/${e.id}`)} />}
    filters={supervisorsOnly ? undefined : [{ label: 'Category', options: STAFF_CATEGORIES, pick: (e) => e.category }, { label: 'Status', options: STATUSES, pick: (e) => e.status }, { label: 'Shift', options: SHIFTS, pick: (e) => e.shift }]}
    columns={[
      { key: 'n', header: 'Employee', sort: (e) => e.name, render: (e) => <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium"><Avatar name={e.name} src={e.photo} size={24} />{e.name}</span>, csv: (e) => e.name },
      { key: 'id', header: 'Emp ID', sort: (e) => e.empId, render: (e) => <Muted>{e.empId}</Muted>, csv: (e) => e.empId },
      { key: 'c', header: 'Category', sort: (e) => e.category, render: (e) => <span className="whitespace-nowrap">{e.category}</span>, csv: (e) => e.category },
      { key: 'p', header: 'Phone', render: (e) => <Muted>{e.phone}</Muted>, hideMobile: true, csv: (e) => e.phone },
      { key: 'em', header: 'Email', render: (e) => <span className="block max-w-[200px] truncate text-muted">{e.email}</span>, hideMobile: true, csv: (e) => e.email },
      { key: 'sh', header: 'Shift', sort: (e) => e.shift, render: (e) => <span className="whitespace-nowrap">{e.shift}</span>, hideMobile: true, csv: (e) => e.shift },
      { key: 'lo', header: 'Location', sort: (e) => e.location, render: (e) => <Muted>{e.location || '—'}</Muted>, hideMobile: true, csv: (e) => e.location },
      { key: 'l', header: 'Active tasks', sort: (e) => activeTasks(e.id, tasks).length, render: (e) => activeTasks(e.id, tasks).length, csv: (e) => activeTasks(e.id, tasks).length },
      { key: 'r', header: 'Rating', sort: (e) => e.rating, render: (e) => e.rating ? <span className="inline-flex items-center gap-1 whitespace-nowrap"><Stars value={e.rating} size={11} />{e.rating}</span> : <Dash />, csv: (e) => e.rating },
      { key: 's', header: 'Status', sort: (e) => e.status, render: (e) => <Pill tone={SS[e.status] ?? 'muted'}>{SL[e.status] ?? e.status}</Pill>, csv: (e) => e.status }]}
    fields={[{ name: 'name', label: 'Full name', required: true }, { name: 'empId', label: 'Employee ID', required: true }, { name: 'category', label: 'Category', type: 'select', required: true, options: supervisorsOnly ? ['Maintenance'] : STAFF_CATEGORIES },
      { name: 'phone', label: 'Phone', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, ...(supervisorsOnly ? [] : [{ name: 'supervisorId', label: 'Supervisor', type: 'select' as const, required: true, options: supervisors.map((s) => ({ value: s.id, label: s.name })) }]),
      { name: 'joiningDate', label: 'Joining date', type: 'date', required: true }, { name: 'skills', label: 'Skills (comma separated)' }, { name: 'shift', label: 'Shift', type: 'select', options: SHIFTS }, { name: 'location', label: 'Current location', type: 'select', options: ['Tower A', 'Tower B', 'Basement', 'Control Room'] }, { name: 'status', label: 'Availability', type: 'select', options: STATUSES, required: true }]}
    transform={(v) => ({ ...v, skills: String(v.skills ?? '').split(',').map((s) => s.trim()).filter(Boolean) })}
    make={(v) => ({ id: uid(supervisorsOnly ? 'sv' : 'st'), role: supervisorsOnly ? 'supervisor' : 'staff', employment: 'Active', attendance: 100, rating: 0, ...v, empId: (v.empId as string) || next } as unknown as Employee)} />
}
