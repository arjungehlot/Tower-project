import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Star, Gauge, Phone, Mail, MapPin, ShieldCheck, CalendarDays, Moon, Wrench, CircleCheck, Briefcase, Coffee, UserX, UserCheck, Loader, PauseCircle, XCircle, Ban, ThumbsUp, type LucideIcon } from 'lucide-react'
import { Avatar, Card, DataTable, Select, StatCard, Stars, Pill, Dash, Muted, type PillTone } from '@/components/ui'
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
const ES: Record<string, { i: LucideIcon; c: string; l: string }> = {
  AVAILABLE: { i: CircleCheck, c: 'bg-ok/10 text-ok', l: 'Available' }, BUSY: { i: Briefcase, c: 'bg-info/10 text-info', l: 'Busy' }, ON_BREAK: { i: Coffee, c: 'bg-warn/10 text-warn', l: 'On break' },
  OFF_DUTY: { i: Moon, c: 'bg-subtle text-muted', l: 'Off duty' }, ABSENT: { i: UserX, c: 'bg-bad/10 text-bad', l: 'Absent' },
}
const TT: Record<string, PillTone> = { ASSIGNED: 'warn', ACCEPTED: 'info', IN_PROGRESS: 'brand', ON_HOLD: 'vis', COMPLETED: 'ok', REJECTED: 'bad', CANCELLED: 'muted' }
const TL: Record<string, string> = { ASSIGNED: 'Assigned', ACCEPTED: 'Accepted', IN_PROGRESS: 'In progress', ON_HOLD: 'On hold', COMPLETED: 'Completed', REJECTED: 'Rejected', CANCELLED: 'Cancelled' }
function Info({ icon, k, children }: { icon: React.ReactNode; k: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2.5 py-1.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subtle text-faint">{icon}</span><div className="min-w-0 leading-tight"><p className="text-[10px] font-semibold uppercase tracking-wider text-faint">{k}</p><p className="truncate text-[13px] font-medium">{children || '—'}</p></div></div>
}
function Meter({ label, value, tone, text }: { label: string; value: number; tone: string; text: string }) {
  return <div><div className="mb-1 flex items-center justify-between text-[11px]"><span className="font-semibold uppercase tracking-wide text-muted">{label}</span><b>{text}</b></div><div className="h-1.5 overflow-hidden rounded-full bg-subtle"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>
}
export default function StaffDetail() {
  const { id } = useParams(), nav = useNavigate(), L = useLookups(), { tasks, patch } = useDb(), { can } = useMe(), e = L.employee(id)
  if (!e) return <p className="p-6 text-muted">Employee not found.</p>
  const m = staffMetrics(e.id, tasks), sup = L.employee(e.supervisorId), es = ES[e.status] ?? ES.OFF_DUTY, EI = es.i
  const days = [...Array(14)].map((_, i) => new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10))
  const trend = days.map((d) => ({ name: d.slice(5), Completed: m.done.filter((t) => dayKey(t.completedAt) === d).length }))
  const ratingTrend = m.rated.sort((a, b) => a.completedAt.localeCompare(b.completedAt)).slice(-10).map((t, i) => ({ name: `#${i + 1}`, Rating: t.rating!.overall }))
  const rating = m.rating || e.rating || 0, load = m.active.length, loadPct = Math.min(100, load * 25)
  return <>
    <Link to={e.role === 'supervisor' ? '/supervisors' : '/staff'} className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"><ArrowLeft size={12} />Back to {e.role === 'supervisor' ? 'supervisors' : 'staff'}</Link>
    <div className="relative mb-3 overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line/70">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar name={e.name} src={e.photo} size={56} />
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold leading-tight tracking-tight">{e.name}</h1>
            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-0.5 text-[11px] font-semibold ${es.c}`}><EI size={12} />{es.l}</span></div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted"><span className="rounded-md bg-brand/10 px-1.5 py-0.5 font-bold text-brand">{e.empId}</span><span className="inline-flex items-center gap-1 rounded-md bg-subtle px-1.5 py-0.5 font-medium"><Wrench size={11} />{e.category}</span>
              <span className="inline-flex items-center gap-1"><Stars value={rating} size={11} /><b className="text-ink">{rating ? rating.toFixed(1) : '—'}</b></span></div></div></div>
        {can('staff', 'update') && <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">Availability</p><Select aria-label="Availability" className="w-40" value={e.status} onChange={(ev) => { patch('employees', e.id, { status: ev.target.value as never }); auditLog(`changed ${e.name} availability to ${ev.target.value}`, 'Staff', e.name); useDb.getState().toast('Availability updated.') }} options={['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY', 'ABSENT']} /></div>}
      </div>
    </div>
    <div className="grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-3">
        <Card title="Profile" pad={false}><div className="divide-y divide-line/50 px-3.5 py-1.5">
          <Info icon={<Phone size={13} />} k="Phone">{e.phone}</Info><Info icon={<Mail size={13} />} k="Email">{e.email}</Info>
          <Info icon={<ShieldCheck size={13} />} k="Supervisor">{sup && <span className="inline-flex items-center gap-1.5"><Avatar name={sup.name} size={16} />{sup.name}</span>}</Info>
          <Info icon={<Clock size={13} />} k="Shift">{e.shift}</Info><Info icon={<MapPin size={13} />} k="Location">{e.location}</Info><Info icon={<CalendarDays size={13} />} k="Joined">{fmtDate(e.joiningDate)}</Info></div>
          {e.skills.length > 0 && <div className="border-t px-3.5 py-2.5"><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">Skills</p><div className="flex flex-wrap gap-1.5">{e.skills.map((k) => <span key={k} className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">{k}</span>)}</div></div>}</Card>
        <Card title="Performance"><div className="space-y-3"><Meter label="Attendance" value={e.attendance} tone="bg-gradient-to-r from-ok to-info" text={`${e.attendance}%`} />
          <Meter label="Satisfaction" value={(rating / 5) * 100} tone="bg-gradient-to-r from-warn to-ok" text={`${Math.round((rating / 5) * 100)}%`} />
          <Meter label="Workload" value={loadPct} tone={load > 3 ? 'bg-bad' : load > 1 ? 'bg-warn' : 'bg-ok'} text={load > 3 ? 'High' : load > 1 ? 'Medium' : 'Low'} /></div></Card>
      </div>
      <div className="min-w-0 space-y-3">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Completed" value={m.done.length} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Pending" value={m.active.length} icon={<Clock size={15} />} tone="warn" /><StatCard label="Overdue" value={m.overdue.length} icon={<AlertTriangle size={15} />} tone="bad" />
          <StatCard label="Avg time" value={`${m.avgTime}m`} icon={<Gauge size={15} />} /><StatCard label="Rating" value={rating ? rating.toFixed(1) : '—'} icon={<Star size={15} />} tone="warn" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="Tasks completed" action={<span className="text-xxs text-muted">Last 14 days</span>}><Bars data={trend} keys={['Completed']} h={150} /></Card>
          <Card title="Rating trend" action={<span className="text-xxs text-muted">Last 10 rated</span>}><LineSeries data={ratingTrend} keys={['Rating']} h={150} /></Card>
        </div>
        <Card title="Work history" action={<span className="rounded-full bg-subtle px-2 py-0.5 text-xxs font-bold text-muted">{m.mine.length}</span>} pad={false}>
          <DataTable rows={m.mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt))} rowKey={(t) => t.id} onRowClick={(t) => nav(`/tasks/${t.id}`)} searchText={(t) => `${t.code} ${t.title}`} pageSize={6}
            columns={[{ key: 'c', header: 'Task', render: (t) => <span className="text-muted">{t.code}</span> }, { key: 't', header: 'Title', render: (t) => t.title },
              { key: 'l', header: 'Location', render: (t) => <span className="block max-w-[220px] truncate text-muted">{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'}</span>, hideMobile: true },
              { key: 'd', header: 'Created', render: (t) => <Muted>{fmtDateTime(t.createdAt)}</Muted>, hideMobile: true },
              { key: 'r', header: 'Rating', render: (t) => t.rating ? <Stars value={t.rating.overall} size={11} /> : <Dash /> },
              { key: 's', header: 'Status', render: (t) => <Pill tone={TT[t.status] ?? 'muted'}>{TL[t.status] ?? t.status}</Pill> }]} />
        </Card>
      </div>
    </div>
  </>
}
