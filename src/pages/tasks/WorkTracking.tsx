import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { DataTable, PageHeader, Select, StatusBadge, Stars } from '@/components/ui'
import { useTasks } from '@/hooks/useTasks'
import { useLookups } from '@/hooks/useLookups'
import { STAFF_CATEGORIES } from '@/utils/constants'
import { fmtTime, fmtDate, duration } from '@/utils/dateUtils'

export default function WorkTracking() {
  const { tasks } = useTasks(), L = useLookups(), nav = useNavigate(), [f, setF] = useState({ cat: '', st: '', sup: '', date: '' })
  const rows = tasks.filter((t) => t.assignedEmployeeId && (!f.cat || t.category === f.cat) && (!f.st || t.status === f.st) && (!f.sup || t.supervisorId === f.sup) && (!f.date || t.createdAt.slice(0, 10) === f.date)).sort((a, b) => (b.startedAt || b.createdAt).localeCompare(a.startedAt || a.createdAt))
  const sups = [...new Set(tasks.map((t) => t.supervisorId).filter(Boolean))].map((id) => ({ value: id, label: L.employee(id)?.name ?? id }))
  return <><PageHeader title="Work Tracking" subtitle="Who worked where, what they did, and who verified it" />
    <DataTable rows={rows} rowKey={(t) => t.id} onRowClick={(t) => nav(`/tasks/${t.id}`)} exportName="work-history" searchText={(t) => `${L.employee(t.assignedEmployeeId)?.name} ${t.title} ${t.code}`}
      filters={<><Select aria-label="Category" className="w-36" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} options={STAFF_CATEGORIES} placeholder="Category" /><Select aria-label="Status" className="w-32" value={f.st} onChange={(e) => setF({ ...f, st: e.target.value })} options={['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']} placeholder="Status" /><Select aria-label="Supervisor" className="w-36" value={f.sup} onChange={(e) => setF({ ...f, sup: e.target.value })} options={sups} placeholder="Supervisor" /><input type="date" aria-label="Date" className="input w-36" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></>}
      columns={[{ key: 'e', header: 'Employee', sort: (t) => L.employee(t.assignedEmployeeId)?.name ?? '', render: (t) => <b>{L.employee(t.assignedEmployeeId)?.name}</b>, csv: (t) => L.employee(t.assignedEmployeeId)?.name }, { key: 'l', header: 'Location', render: (t) => L.location(t.towerId, t.floorId, t.officeId) || 'Common area', csv: (t) => L.location(t.towerId, t.floorId, t.officeId) }, { key: 'w', header: 'Work', render: (t) => t.title, csv: (t) => t.title },
        { key: 'st', header: 'Started', sort: (t) => t.startedAt, render: (t) => t.startedAt ? `${fmtDate(t.startedAt)} ${fmtTime(t.startedAt)}` : '—', csv: (t) => t.startedAt }, { key: 'c', header: 'Completed', render: (t) => t.completedAt ? fmtTime(t.completedAt) : '—', csv: (t) => t.completedAt }, { key: 'du', header: 'Duration', render: (t) => t.startedAt && t.completedAt ? duration(t.startedAt, t.completedAt) : '—', hideMobile: true },
        { key: 'a', header: 'Assigned by', render: (t) => L.user(t.createdBy)?.name ?? 'System', hideMobile: true }, { key: 'v', header: 'Verified', render: (t) => t.verifiedAt ? <span>{fmtTime(t.verifiedAt)} <span className="text-muted">· {L.employee(t.verifiedBy)?.name ?? 'Supervisor'}</span></span> : '—', hideMobile: true, csv: (t) => t.verifiedAt },
        { key: 'r', header: 'Rating', sort: (t) => t.rating?.overall ?? 0, render: (t) => t.rating ? <span className="inline-flex items-center gap-1"><Stars value={t.rating.overall} size={11} />{t.rating.overall}</span> : '—', csv: (t) => t.rating?.overall }, { key: 's', header: 'Status', render: (t) => <StatusBadge status={t.status} />, csv: (t) => t.status }]} /></>
}
