import { useNavigate } from 'react-router-dom'
import { CrudPage } from '@/components/business/CrudPage'
import { Avatar, StatusBadge, Stars } from '@/components/ui'
import { useDb } from '@/store/db'
import { useEmployees } from '@/hooks/useEmployees'
import { activeTasks } from '@/services/employeeService'
import { STAFF_CATEGORIES, SHIFTS } from '@/utils/constants'
import { fmtDate } from '@/utils/dateUtils'
import { uid } from '@/utils/helpers'
import type { Employee } from '@/types'

const STATUSES = ['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY', 'ABSENT']
export default function StaffList({ supervisorsOnly }: { supervisorsOnly?: boolean }) {
  const nav = useNavigate(), { staff, supervisors } = useEmployees(), tasks = useDb((s) => s.tasks)
  const next = `EMP-${1000 + staff.length + supervisors.length + 1}`
  return <CrudPage<Employee> title={supervisorsOnly ? 'Supervisors' : 'Staff Management'} subtitle={supervisorsOnly ? 'Team leads who verify and rate work' : 'Registered service staff across all categories'} coll="employees" entity={supervisorsOnly ? 'Supervisor' : 'Staff'} rows={supervisorsOnly ? supervisors : staff}
    label={(e) => e.name} searchText={(e) => `${e.name} ${e.empId} ${e.category} ${e.phone}`} onRowClick={(e) => nav(`/staff/${e.id}`)} pageSize={12}
    filters={supervisorsOnly ? undefined : [{ label: 'Category', options: STAFF_CATEGORIES, pick: (e) => e.category }, { label: 'Status', options: STATUSES, pick: (e) => e.status }, { label: 'Shift', options: SHIFTS, pick: (e) => e.shift }]}
    columns={[{ key: 'n', header: 'Employee', sort: (e) => e.name, render: (e) => <div className="flex items-center gap-2"><Avatar name={e.name} src={e.photo} size={28} /><div><p className="font-semibold">{e.name}</p><p className="text-xxs text-muted">{e.empId}</p></div></div>, csv: (e) => e.name },
      { key: 'c', header: 'Category', sort: (e) => e.category, render: (e) => e.category, csv: (e) => e.category }, { key: 'p', header: 'Phone', render: (e) => e.phone, hideMobile: true, csv: (e) => e.phone }, { key: 'sh', header: 'Shift', sort: (e) => e.shift, render: (e) => e.shift, hideMobile: true },
      { key: 'l', header: 'Active tasks', sort: (e) => activeTasks(e.id, tasks).length, render: (e) => activeTasks(e.id, tasks).length, csv: (e) => activeTasks(e.id, tasks).length }, { key: 'r', header: 'Rating', sort: (e) => e.rating, render: (e) => e.rating ? <span className="inline-flex items-center gap-1"><Stars value={e.rating} size={11} />{e.rating}</span> : '—', csv: (e) => e.rating },
      { key: 's', header: 'Status', sort: (e) => e.status, render: (e) => <StatusBadge status={e.status} />, csv: (e) => e.status }]}
    fields={[{ name: 'name', label: 'Full name', required: true }, { name: 'empId', label: 'Employee ID', required: true }, { name: 'category', label: 'Category', type: 'select', required: true, options: supervisorsOnly ? ['Maintenance'] : STAFF_CATEGORIES },
      { name: 'phone', label: 'Phone', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, ...(supervisorsOnly ? [] : [{ name: 'supervisorId', label: 'Supervisor', type: 'select' as const, required: true, options: supervisors.map((s) => ({ value: s.id, label: s.name })) }]),
      { name: 'joiningDate', label: 'Joining date', type: 'date', required: true }, { name: 'skills', label: 'Skills (comma separated)' }, { name: 'shift', label: 'Shift', type: 'select', options: SHIFTS }, { name: 'location', label: 'Current location', type: 'select', options: ['Tower A', 'Tower B', 'Basement', 'Control Room'] }, { name: 'status', label: 'Availability', type: 'select', options: STATUSES, required: true }]}
    transform={(v) => ({ ...v, skills: String(v.skills ?? '').split(',').map((s) => s.trim()).filter(Boolean) })}
    make={(v) => ({ id: uid(supervisorsOnly ? 'sv' : 'st'), role: supervisorsOnly ? 'supervisor' : 'staff', employment: 'Active', attendance: 100, rating: 0, ...v, empId: (v.empId as string) || next } as unknown as Employee)} />
}
