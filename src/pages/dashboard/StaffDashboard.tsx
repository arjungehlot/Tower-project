import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Star, ClipboardList } from 'lucide-react'
import { Card, EmptyState, PageHeader, ProgressBar, StatCard, StatusBadge, Select } from '@/components/ui'
import { TaskActions } from '@/components/business/TaskActions'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { staffMetrics } from '@/pages/staff/StaffDetail'
import { fmtDateTime } from '@/utils/dateUtils'

export default function StaffDashboard() {
  const nav = useNavigate(), { me } = useMe(), L = useLookups(), tasks = useDb((s) => s.tasks), patch = useDb((s) => s.patch), e = L.employee(me?.refId)
  if (!e) return <EmptyState title="No staff profile linked" />
  const m = staffMetrics(e.id, tasks)
  return <>
    <PageHeader title={`Hi ${e.name.split(' ')[0]}, here is your work`} subtitle={`${e.category} · ${e.empId} · ${e.shift} shift`} actions={<Select aria-label="My availability" className="w-40" value={e.status} onChange={(ev) => { patch('employees', e.id, { status: ev.target.value as never }); useDb.getState().toast('Availability updated.') }} options={['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY']} />} />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Active tasks" value={m.active.length} icon={<ClipboardList size={15} />} tone="info" /><StatCard label="Completed" value={m.done.length} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Overdue" value={m.overdue.length} icon={<Clock size={15} />} tone="bad" /><StatCard label="My rating" value={m.rating || e.rating} icon={<Star size={15} />} tone="warn" /></div>
    <Card title="Assigned to me" pad={false}><div className="divide-y divide-line">{m.active.map((t) => <div key={t.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center"><button onClick={() => nav(`/tasks/${t.id}`)} className="min-w-0 flex-1 text-left"><p className="flex items-center gap-2 text-sm font-semibold">{t.title}<StatusBadge status={t.priority} /></p><p className="text-xs text-muted">{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'} · Due {fmtDateTime(t.deadline)}</p><ProgressBar className="mt-1.5 max-w-xs" value={t.progress} /></button><div className="flex gap-2"><StatusBadge status={t.status} /><TaskActions t={t} size="md" /></div></div>)}{!m.active.length && <EmptyState title="You're all caught up" text="New assignments will appear here and in your notifications." />}</div></Card>
  </>
}
