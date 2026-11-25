import { useNavigate } from 'react-router-dom'
import { Star, CheckCircle2, Clock, Gauge } from 'lucide-react'
import { Avatar, Card, DataTable, PageHeader, StatCard, Stars } from '@/components/ui'
import { Bars, LineSeries } from '@/components/charts'
import { TaskActions } from '@/components/business/TaskActions'
import { useDb } from '@/store/db'
import { useEmployees } from '@/hooks/useEmployees'
import { useLookups } from '@/hooks/useLookups'
import { staffMetrics } from '@/pages/staff/StaffDetail'
import { STAFF_CATEGORIES } from '@/utils/constants'
import { avg } from '@/utils/helpers'
import { dayKey } from '@/utils/dateUtils'

export default function Ratings() {
  const nav = useNavigate(), { staff, stats } = useEmployees(), tasks = useDb((s) => s.tasks), L = useLookups()
  const rows = staff.map((e) => ({ e, m: staffMetrics(e.id, tasks) }))
  const toVerify = tasks.filter((t) => t.status === 'COMPLETED' && !t.verifiedAt)
  const catPerf = STAFF_CATEGORIES.map((c) => ({ name: c.replace(' Technician', ''), Rating: avg(rows.filter((r) => r.e.category === c && r.m.rating).map((r) => r.m.rating)), Tasks: rows.filter((r) => r.e.category === c).reduce((a, r) => a + r.m.done.length, 0) })).filter((c) => c.Tasks)
  const top = [...rows].filter((r) => r.m.done.length).sort((a, b) => b.m.done.length - a.m.done.length).slice(0, 8).map((r) => ({ name: r.e.name.split(' ')[0], Completed: r.m.done.length, Pending: r.m.active.length }))
  const days = [...Array(14)].map((_, i) => new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10))
  const trend = days.map((d) => ({ name: d.slice(5), Completed: tasks.filter((t) => t.completedAt && dayKey(t.completedAt) === d).length, Rating: avg(tasks.filter((t) => t.rating && t.verifiedAt && dayKey(t.verifiedAt) === d).map((t) => t.rating!.overall)) }))
  return <><PageHeader title="Ratings & Performance" subtitle="Verify completed work and track staff performance" />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Average rating" value={stats.avgRating} icon={<Star size={15} />} tone="warn" /><StatCard label="Awaiting verification" value={toVerify.length} icon={<Clock size={15} />} tone="info" /><StatCard label="Completed (all time)" value={tasks.filter((t) => t.status === 'COMPLETED').length} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Avg completion" value={`${Math.round(avg(rows.filter((r) => r.m.avgTime).map((r) => r.m.avgTime)))}m`} icon={<Gauge size={15} />} /></div>
    {toVerify.length > 0 && <Card className="mb-4" title={`Awaiting verification (${toVerify.length})`} pad={false}><ul className="divide-y divide-line">{toVerify.slice(0, 6).map((t) => <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2"><div><p className="text-xs font-semibold">{t.code} · {t.title}</p><p className="text-xxs text-muted">{L.employee(t.assignedEmployeeId)?.name} · {L.location(t.towerId, t.floorId, t.officeId)}</p></div><TaskActions t={t} /></li>)}</ul></Card>}
    <div className="mb-3 grid gap-3 lg:grid-cols-3"><Card title="Tasks completed & rating trend"><LineSeries data={trend} keys={['Completed', 'Rating']} h={200} /></Card><Card title="Category performance (avg rating)"><Bars data={catPerf} keys={['Rating']} h={200} /></Card><Card title="Employee comparison"><Bars data={top} keys={['Completed', 'Pending']} horizontal h={200} /></Card></div>
    <DataTable rows={rows} rowKey={(r) => r.e.id} onRowClick={(r) => nav(`/staff/${r.e.id}`)} searchText={(r) => `${r.e.name} ${r.e.category}`} exportName="staff-performance" defaultSort={{ key: 'r', dir: 'desc' }}
      columns={[{ key: 'n', header: 'Employee', sort: (r) => r.e.name, render: (r) => <span className="flex items-center gap-2"><Avatar name={r.e.name} size={24} />{r.e.name}</span>, csv: (r) => r.e.name }, { key: 'c', header: 'Category', sort: (r) => r.e.category, render: (r) => r.e.category, csv: (r) => r.e.category }, { key: 'd', header: 'Completed', sort: (r) => r.m.done.length, render: (r) => r.m.done.length, csv: (r) => r.m.done.length }, { key: 'p', header: 'Pending', sort: (r) => r.m.active.length, render: (r) => r.m.active.length, csv: (r) => r.m.active.length }, { key: 'o', header: 'Overdue', sort: (r) => r.m.overdue.length, render: (r) => r.m.overdue.length, csv: (r) => r.m.overdue.length }, { key: 't', header: 'Avg time', sort: (r) => r.m.avgTime, render: (r) => `${r.m.avgTime}m`, csv: (r) => r.m.avgTime, hideMobile: true }, { key: 'r', header: 'Rating', sort: (r) => r.m.rating || r.e.rating, render: (r) => <span className="inline-flex items-center gap-1"><Stars value={r.m.rating || r.e.rating} size={11} />{r.m.rating || r.e.rating}</span>, csv: (r) => r.m.rating || r.e.rating }, { key: 'a', header: 'Attendance', sort: (r) => r.e.attendance, render: (r) => `${r.e.attendance}%`, hideMobile: true, csv: (r) => r.e.attendance }]} /></>
}
