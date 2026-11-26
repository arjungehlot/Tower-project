import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Star, ClipboardList, MapPin, CalendarClock } from 'lucide-react'
import { EmptyState, PageHeader, ProgressBar, StatCard, StatusBadge, Select } from '@/components/ui'
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
    <div className="mb-2 flex items-center justify-between"><h2 className="text-[13px] font-semibold">Assigned to me <span className="ml-1 rounded-full bg-subtle px-1.5 py-0.5 text-[10.5px] font-bold text-muted">{m.active.length}</span></h2></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {m.active.map((t) => { const late = new Date(t.deadline).getTime() < Date.now(); return <div key={t.id} className="flex flex-col rounded-2xl bg-surface p-3 shadow-card ring-1 ring-line/70 transition-all hover:-translate-y-0.5 hover:shadow-pop">
        <div className="flex items-center justify-between gap-2"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></div>
        <button onClick={() => nav(`/tasks/${t.id}`)} className="mt-2.5 text-left"><p className="line-clamp-2 text-[14px] font-bold leading-snug hover:text-brand">{t.title}</p></button>
        <div className="mt-2 space-y-1 text-[11.5px] text-muted">
          <p className="flex items-center gap-1.5"><MapPin size={12} className="shrink-0 text-faint" /><span className="truncate">{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'}</span></p>
          <p className={`flex items-center gap-1.5 ${late ? 'font-semibold text-bad' : ''}`}><CalendarClock size={12} className={`shrink-0 ${late ? '' : 'text-faint'}`} />{late ? 'Overdue · ' : 'Due '}{fmtDateTime(t.deadline)}</p>
        </div>
        <div className="mt-3 rounded-xl bg-subtle/70 px-2.5 py-2"><div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted"><span>Progress</span><span className="text-ink">{t.progress}%</span></div><ProgressBar value={t.progress} /></div>
        <div className="mt-3 flex flex-wrap gap-1.5 [&>*]:flex-1 [&>*]:justify-center [&>*]:whitespace-nowrap"><TaskActions t={t} size="md" /></div>
      </div> })}
      {!m.active.length && <div className="col-span-full rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line/70"><EmptyState title="No active tasks" text="New assignments will appear here." /></div>}
    </div>
  </>
}
