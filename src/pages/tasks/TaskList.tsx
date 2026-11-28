import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Avatar, Button, DataTable, PageHeader, Select, StatCard, Stars, Tabs, Pill, Dash, Muted, shortDT, type PillTone } from '@/components/ui'
import { TaskForm } from '@/components/business/TaskForm'
import { TaskActions } from '@/components/business/TaskActions'
import { useTasks } from '@/hooks/useTasks'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import { STAFF_CATEGORIES, PRIORITIES } from '@/utils/constants'
import { Clock, CheckCircle2, AlertTriangle, BadgeCheck } from 'lucide-react'

const TT: Record<string, PillTone> = { ASSIGNED: 'warn', ACCEPTED: 'info', IN_PROGRESS: 'brand', ON_HOLD: 'vis', COMPLETED: 'ok', REJECTED: 'bad', CANCELLED: 'muted' }
const TL: Record<string, string> = { ASSIGNED: 'Assigned', ACCEPTED: 'Accepted', IN_PROGRESS: 'In progress', ON_HOLD: 'On hold', COMPLETED: 'Completed', REJECTED: 'Rejected', CANCELLED: 'Cancelled' }
const PC: Record<string, string> = { CRITICAL: 'text-bad', HIGH: 'text-warn' }
const when = (d: string) => { const ms = new Date(d).getTime() - Date.now(), m = Math.round(Math.abs(ms) / 60000), t = m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; return ms < 0 ? `${t} overdue` : `in ${t}` }
const OPEN = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD']

export default function TaskList() {
  const nav = useNavigate(), L = useLookups(), { me, can, empId } = useMe(), { tasks, stats } = useTasks(), [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false), [tab, setTab] = useState('all'), [f, setF] = useState({ category: '', priority: '', emp: '' })
  useEffect(() => { if (params.get('new')) { setOpen(true); setParams({}, { replace: true }) } }, [params]) // eslint-disable-line
  const mine = me?.role === 'STAFF' ? tasks.filter((t) => t.assignedEmployeeId === empId) : tasks
  const groups: Record<string, (s: string) => boolean> = { all: () => true, active: (s) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD'].includes(s), done: (s) => s === 'COMPLETED', closed: (s) => ['REJECTED', 'CANCELLED'].includes(s) }
  const rows = mine.filter((t) => groups[tab](t.status) && (!f.category || t.category === f.category) && (!f.priority || t.priority === f.priority) && (!f.emp || t.assignedEmployeeId === f.emp)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const emps = [...new Set(mine.map((t) => t.assignedEmployeeId).filter(Boolean))].map((id) => ({ value: id, label: L.employee(id)?.name ?? id }))
  return <>
    <PageHeader title={me?.role === 'STAFF' ? 'My Tasks' : 'Work Assignments'} subtitle="Assign, track and verify work" actions={can('tasks', 'create') && <Button variant="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>Assign task</Button>} />
    {me?.role !== 'STAFF' && <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Pending tasks" value={stats.pending} icon={<Clock size={15} />} tone="warn" /><StatCard label="Completed today" value={stats.completedToday} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Overdue" value={stats.overdue} icon={<AlertTriangle size={15} />} tone="bad" /><StatCard label="Awaiting verification" value={stats.toVerify} icon={<BadgeCheck size={15} />} tone="info" /></div>}
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All', count: mine.length }, { id: 'active', label: 'Active', count: mine.filter((t) => groups.active(t.status)).length }, { id: 'done', label: 'Completed', count: mine.filter((t) => t.status === 'COMPLETED').length }, { id: 'closed', label: 'Rejected / cancelled' }]} />
    <div className="mt-3"><DataTable rows={rows} rowKey={(t) => t.id} onRowClick={(t) => nav(`/tasks/${t.id}`)} searchText={(t) => `${t.code} ${t.title} ${L.employee(t.assignedEmployeeId)?.name}`} exportName="tasks"
      filters={<><Select aria-label="Category" className="w-36" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} options={STAFF_CATEGORIES} placeholder="Category" /><Select aria-label="Priority" className="w-28" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} options={PRIORITIES} placeholder="Priority" />{me?.role !== 'STAFF' && <Select aria-label="Employee" className="w-36" value={f.emp} onChange={(e) => setF({ ...f, emp: e.target.value })} options={emps} placeholder="Employee" />}</>}
      columns={[
        { key: 'c', header: 'Task', sort: (t) => t.code, render: (t) => <span className="block max-w-[300px] truncate"><span className="text-muted">{t.code}</span> · {t.title}</span>, csv: (t) => t.title },
        { key: 'ca', header: 'Category', sort: (t) => t.category, render: (t) => <Muted>{t.category}</Muted>, csv: (t) => t.category, hideMobile: true },
        { key: 'l', header: 'Location', render: (t) => <span className="block max-w-[210px] truncate text-muted">{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'}</span>, hideMobile: true, csv: (t) => L.location(t.towerId, t.floorId, t.officeId) },
        { key: 'e', header: 'Assigned to', sort: (t) => L.employee(t.assignedEmployeeId)?.name ?? '', render: (t) => { const e = L.employee(t.assignedEmployeeId); return e ? <span className="inline-flex items-center gap-2 whitespace-nowrap"><Avatar name={e.name} size={22} />{e.name}</span> : <Dash /> }, csv: (t) => L.employee(t.assignedEmployeeId)?.name },
        { key: 'p', header: 'Priority', sort: (t) => PRIORITIES.indexOf(t.priority), render: (t) => <span className={`whitespace-nowrap capitalize ${PC[t.priority] ?? 'text-muted'}`}>{t.priority.toLowerCase()}</span>, csv: (t) => t.priority },
        { key: 'd', header: 'Deadline', sort: (t) => t.deadline, render: (t) => { const late = OPEN.includes(t.status) && new Date(t.deadline).getTime() < Date.now(); return <span className={`whitespace-nowrap ${late ? 'text-bad' : ''}`}>{shortDT(t.deadline)}{OPEN.includes(t.status) && <span className={late ? '' : 'text-muted'}> · {when(t.deadline)}</span>}</span> }, csv: (t) => t.deadline },
        { key: 'pg', header: 'Progress', sort: (t) => t.progress, render: (t) => <Muted>{t.progress}%</Muted>, hideMobile: true, csv: (t) => t.progress },
        { key: 'r', header: 'Rating', render: (t) => t.rating ? <span className="inline-flex items-center gap-1 whitespace-nowrap"><Stars value={t.rating.overall} size={11} />{t.rating.overall}</span> : <Dash />, hideMobile: true },
        { key: 's', header: 'Status', sort: (t) => t.status, render: (t) => <Pill tone={TT[t.status] ?? 'muted'}>{TL[t.status] ?? t.status}</Pill>, csv: (t) => t.status },
        { key: 'a', header: 'Actions', render: (t) => <div className="flex gap-1" onClick={(e) => e.stopPropagation()}><TaskActions t={t} size="xs" /></div> }]} /></div>
    <TaskForm open={open} onClose={() => setOpen(false)} />
  </>
}
