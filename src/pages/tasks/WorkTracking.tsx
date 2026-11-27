import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Avatar, DataTable, PageHeader, Select, Stars } from '@/components/ui'
import { useTasks } from '@/hooks/useTasks'
import { useLookups } from '@/hooks/useLookups'
import { STAFF_CATEGORIES } from '@/utils/constants'
import { fmtTime, fmtDate, duration } from '@/utils/dateUtils'

const ST: Record<string, { c: string; l: string }> = {
  ASSIGNED: { c: 'bg-warn/10 text-warn', l: 'Assigned' }, ACCEPTED: { c: 'bg-info/10 text-info', l: 'Accepted' }, IN_PROGRESS: { c: 'bg-brand/10 text-brand', l: 'In progress' },
  ON_HOLD: { c: 'bg-vis/10 text-vis', l: 'On hold' }, COMPLETED: { c: 'bg-ok/10 text-ok', l: 'Completed' }, REJECTED: { c: 'bg-bad/10 text-bad', l: 'Rejected' }, CANCELLED: { c: 'bg-subtle text-muted', l: 'Cancelled' },
}
/** Time the employee accepted the task, taken from the timeline. */
const acc = (t: { timeline: { at: string; label: string }[] }) => t.timeline.find((x) => /accepted/i.test(x.label))?.at ?? ''
const when = (iso: string) => iso ? <span className="whitespace-nowrap">{fmtDate(iso).replace(/ \d{4}$/, '')}, {fmtTime(iso)}</span> : <span className="text-faint">—</span>

export default function WorkTracking() {
  const { tasks } = useTasks(), L = useLookups(), nav = useNavigate(), [f, setF] = useState({ cat: '', st: '', sup: '', date: '' })
  const rows = tasks.filter((t) => t.assignedEmployeeId && (!f.cat || t.category === f.cat) && (!f.st || t.status === f.st) && (!f.sup || t.supervisorId === f.sup) && (!f.date || t.createdAt.slice(0, 10) === f.date)).sort((a, b) => (b.startedAt || b.createdAt).localeCompare(a.startedAt || a.createdAt))
  const sups = [...new Set(tasks.map((t) => t.supervisorId).filter(Boolean))].map((id) => ({ value: id, label: L.employee(id)?.name ?? id }))
  return <><PageHeader title="Work Tracking" subtitle="Who worked where, what they did, and who verified it" />
    <DataTable rows={rows} rowKey={(t) => t.id} onRowClick={(t) => nav(`/tasks/${t.id}`)} exportName="work-history" searchText={(t) => `${L.employee(t.assignedEmployeeId)?.name} ${t.title} ${t.code}`}
      filters={<><Select aria-label="Category" className="w-36" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} options={STAFF_CATEGORIES} placeholder="Category" /><Select aria-label="Status" className="w-32" value={f.st} onChange={(e) => setF({ ...f, st: e.target.value })} options={['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']} placeholder="Status" /><Select aria-label="Supervisor" className="w-36" value={f.sup} onChange={(e) => setF({ ...f, sup: e.target.value })} options={sups} placeholder="Supervisor" /><input type="date" aria-label="Date" className="input w-36" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></>}
      columns={[
        { key: 'e', header: 'Employee', className: 'whitespace-nowrap', sort: (t) => L.employee(t.assignedEmployeeId)?.name ?? '', render: (t) => <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium"><Avatar name={L.employee(t.assignedEmployeeId)?.name ?? '?'} size={22} />{L.employee(t.assignedEmployeeId)?.name}</span>, csv: (t) => L.employee(t.assignedEmployeeId)?.name },
        { key: 'w', header: 'Work', className: 'whitespace-nowrap', render: (t) => <span className="block max-w-[260px] truncate"><span className="text-muted">{t.code}</span> · {t.title}</span>, csv: (t) => t.title },
        { key: 'l', header: 'Location', className: 'whitespace-nowrap', render: (t) => <span className="block max-w-[210px] truncate text-muted">{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'}</span>, csv: (t) => L.location(t.towerId, t.floorId, t.officeId) },
        { key: 'a', header: 'Assigned by', className: 'whitespace-nowrap', render: (t) => <span className="whitespace-nowrap">{L.user(t.createdBy)?.name ?? 'System'}</span>, hideMobile: true },
        { key: 'ac', header: 'Accepted', className: 'whitespace-nowrap', sort: (t) => acc(t), render: (t) => when(acc(t)), csv: (t) => acc(t) },
        { key: 'st', header: 'Started', className: 'whitespace-nowrap', sort: (t) => t.startedAt, render: (t) => when(t.startedAt), csv: (t) => t.startedAt },
        { key: 'c', header: 'Completed', className: 'whitespace-nowrap', sort: (t) => t.completedAt, render: (t) => when(t.completedAt), csv: (t) => t.completedAt },
        { key: 'du', header: 'Duration', className: 'whitespace-nowrap', render: (t) => t.startedAt && t.completedAt ? <span className="whitespace-nowrap">{duration(t.startedAt, t.completedAt)}</span> : <span className="text-faint">—</span>, hideMobile: true, csv: (t) => (t.startedAt && t.completedAt ? duration(t.startedAt, t.completedAt) : '') },
        { key: 'v', header: 'Verified', className: 'whitespace-nowrap', render: (t) => t.verifiedAt ? <span className="whitespace-nowrap">{fmtTime(t.verifiedAt)} <span className="text-muted">· {L.employee(t.verifiedBy)?.name ?? 'Supervisor'}</span></span> : <span className="text-faint">—</span>, hideMobile: true, csv: (t) => t.verifiedAt },
        { key: 'r', header: 'Rating', className: 'whitespace-nowrap', sort: (t) => t.rating?.overall ?? 0, render: (t) => t.rating ? <span className="inline-flex items-center gap-1 whitespace-nowrap"><Stars value={t.rating.overall} size={11} />{t.rating.overall}</span> : <span className="text-faint">—</span>, csv: (t) => t.rating?.overall },
        { key: 's', header: 'Status', className: 'whitespace-nowrap', sort: (t) => t.status, render: (t) => { const m = ST[t.status] ?? ST.ASSIGNED; return <span className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ${m.c}`}>{m.l}</span> }, csv: (t) => t.status }]} /></>
}
