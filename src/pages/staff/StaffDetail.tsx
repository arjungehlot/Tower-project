import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Star, Gauge, CalendarCheck, Briefcase } from 'lucide-react'
import { Avatar, Card, DataTable, KV, PageHeader, Select, StatCard, StatusBadge, Stars } from '@/components/ui'
import { Bars, LineSeries } from '@/components/charts'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import { avg } from '@/utils/helpers'
import { fmtDate, fmtDateTime, dayKey } from '@/utils/dateUtils'
import { auditLog } from '@/services/core'
import { activeTasks } from '@/services/employeeService'

export function staffMetrics(empId: string, tasks: ReturnType<typeof useDb.getState>['tasks']) {
  const mine = tasks.filter((t) => t.assignedEmployeeId === empId), done = mine.filter((t) => t.status === 'COMPLETED')
  const act = activeTasks(empId, tasks), times = done.filter((t) => t.startedAt && t.completedAt).map((t) => (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) / 60000)
  const rated = done.filter((t) => t.rating)
  return { mine, done, active: act, overdue: act.filter((t) => new Date(t.deadline) < new Date()), avgTime: Math.round(avg(times)), rating: avg(rated.map((t) => t.rating!.overall)), rated }
}
export default function StaffDetail() {
  const { id } = useParams(), nav = useNavigate(), L = useLookups(), { tasks, patch } = useDb(), { can } = useMe(), e = L.employee(id)
  if (!e) return <p className="p-6 text-muted">Employee not found.</p>
  const m = staffMetrics(e.id, tasks)
  const days = [...Array(14)].map((_, i) => new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10))
  const trend = days.map((d) => ({ name: d.slice(5), Completed: m.done.filter((t) => dayKey(t.completedAt) === d).length }))
  const ratingTrend = m.rated.sort((a, b) => a.completedAt.localeCompare(b.completedAt)).slice(-10).map((t, i) => ({ name: `#${i + 1}`, Rating: t.rating!.overall }))
  return <>
    <PageHeader back={<Link to={e.role === 'supervisor' ? '/supervisors' : '/staff'} className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Back</Link>}
      title={<span className="flex items-center gap-2"><Avatar name={e.name} src={e.photo} size={34} />{e.name}<StatusBadge status={e.status} /></span>} subtitle={`${e.category} · ${e.empId}`}
      actions={can('staff', 'update') && <Select aria-label="Availability" className="w-40" value={e.status} onChange={(ev) => { patch('employees', e.id, { status: ev.target.value as never }); auditLog(`changed ${e.name} availability to ${ev.target.value}`, 'Staff', e.name); useDb.getState().toast('Availability updated.') }} options={['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY', 'ABSENT']} />} />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
      <StatCard label="Completed" value={m.done.length} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Pending" value={m.active.length} icon={<Clock size={15} />} tone="warn" /><StatCard label="Overdue" value={m.overdue.length} icon={<AlertTriangle size={15} />} tone="bad" /><StatCard label="Avg time" value={`${m.avgTime}m`} icon={<Gauge size={15} />} />
      <StatCard label="Rating" value={m.rating || e.rating || 0} icon={<Star size={15} />} tone="warn" /><StatCard label="Satisfaction" value={`${Math.round(((m.rating || e.rating || 4) / 5) * 100)}%`} icon={<Star size={15} />} tone="ok" /><StatCard label="Attendance" value={`${e.attendance}%`} icon={<CalendarCheck size={15} />} tone="info" /><StatCard label="Workload" value={m.active.length > 3 ? 'High' : m.active.length > 1 ? 'Medium' : 'Low'} icon={<Briefcase size={15} />} />
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      <Card title="Profile"><KV k="Phone" v={e.phone} /><KV k="Email" v={e.email} /><KV k="Supervisor" v={L.employee(e.supervisorId)?.name} /><KV k="Joined" v={fmtDate(e.joiningDate)} /><KV k="Shift" v={e.shift} /><KV k="Location" v={e.location} /><KV k="Skills" v={e.skills.join(', ')} /></Card>
      <Card title="Tasks completed (14 days)"><Bars data={trend} keys={['Completed']} h={170} /></Card>
      <Card title="Rating trend"><LineSeries data={ratingTrend} keys={['Rating']} h={170} /></Card>
    </div>
    <h2 className="mb-2 mt-5 text-sm font-semibold">Work history</h2>
    <DataTable rows={m.mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt))} rowKey={(t) => t.id} onRowClick={(t) => nav(`/tasks/${t.id}`)} searchText={(t) => `${t.code} ${t.title}`} pageSize={8}
      columns={[{ key: 'c', header: 'Task', render: (t) => <b>{t.code}</b> }, { key: 't', header: 'Title', render: (t) => t.title }, { key: 'l', header: 'Location', render: (t) => L.location(t.towerId, t.floorId, t.officeId), hideMobile: true }, { key: 'd', header: 'Created', render: (t) => fmtDateTime(t.createdAt), hideMobile: true }, { key: 'r', header: 'Rating', render: (t) => t.rating ? <Stars value={t.rating.overall} size={11} /> : '—' }, { key: 's', header: 'Status', render: (t) => <StatusBadge status={t.status} /> }]} />
  </>
}
