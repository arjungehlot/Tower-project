import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Star, ClipboardList, MapPin, CalendarClock, Wrench, UserCheck, Loader, PauseCircle, type LucideIcon } from 'lucide-react'
import { EmptyState, PageHeader, StatCard, Select } from '@/components/ui'
import { TaskActions } from '@/components/business/TaskActions'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { staffMetrics } from '@/pages/staff/StaffDetail'
import { fmtDateTime } from '@/utils/dateUtils'

const ST: Record<string, { i: LucideIcon; c: string; l: string; spin?: boolean }> = {
  ASSIGNED: { i: UserCheck, c: 'bg-warn/10 text-warn', l: 'Assigned' }, ACCEPTED: { i: CheckCircle2, c: 'bg-info/10 text-info', l: 'Accepted' },
  IN_PROGRESS: { i: Loader, c: 'bg-brand/10 text-brand', l: 'In progress', spin: true }, ON_HOLD: { i: PauseCircle, c: 'bg-vis/10 text-vis', l: 'On hold' },
}
const PR: Record<string, { c: string; l: string; bars: number }> = { CRITICAL: { c: 'text-bad', l: 'Critical', bars: 4 }, HIGH: { c: 'text-warn', l: 'High', bars: 3 }, MEDIUM: { c: 'text-info', l: 'Medium', bars: 2 }, LOW: { c: 'text-muted', l: 'Low', bars: 1 } }
const left = (d: string) => { const ms = new Date(d).getTime() - Date.now(), a = Math.abs(ms), m = Math.round(a / 60000), t = m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; return ms < 0 ? `Overdue by ${t}` : `Due in ${t}` }

export default function StaffDashboard() {
  const nav = useNavigate(), { me } = useMe(), L = useLookups(), tasks = useDb((s) => s.tasks), patch = useDb((s) => s.patch), e = L.employee(me?.refId)
  if (!e) return <EmptyState title="No staff profile linked" />
  const m = staffMetrics(e.id, tasks)
  return <>
    <PageHeader title={`Hi ${e.name.split(' ')[0]}, here is your work`} subtitle={`${e.category} · ${e.empId} · ${e.shift} shift`} actions={<Select aria-label="My availability" className="w-40" value={e.status} onChange={(ev) => { patch('employees', e.id, { status: ev.target.value as never }); useDb.getState().toast('Availability updated.') }} options={['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY']} />} />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Active tasks" value={m.active.length} icon={<ClipboardList size={15} />} tone="info" /><StatCard label="Completed" value={m.done.length} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Overdue" value={m.overdue.length} icon={<Clock size={15} />} tone="bad" /><StatCard label="My rating" value={m.rating || e.rating} icon={<Star size={15} />} tone="warn" /></div>
    <div className="mb-2 flex items-center justify-between"><h2 className="text-[13px] font-semibold">Assigned to me <span className="ml-1 rounded-full bg-subtle px-1.5 py-0.5 text-[10.5px] font-bold text-muted">{m.active.length}</span></h2></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {m.active.map((t) => { const late = new Date(t.deadline).getTime() < Date.now(), st = ST[t.status] ?? ST.ASSIGNED, SI = st.i, pr = PR[t.priority] ?? PR.LOW; return <div key={t.id} className="group flex flex-col rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line/70 transition-all hover:-translate-y-0.5 hover:shadow-pop">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide ${pr.c}`}><span className="flex h-3.5 items-end gap-[2px]">{[1, 2, 3, 4].map((n) => <i key={n} className={`w-[3px] rounded-sm bg-current ${n <= pr.bars ? '' : 'opacity-20'}`} style={{ height: 3 + n * 2.5 }} />)}</span>{pr.l}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold ${st.c}`}><SI size={12} className={st.spin ? 'animate-spin [animation-duration:2.5s]' : ''} />{st.l}</span></div>
        <div className="mt-3 flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-vis/10 text-brand"><Wrench size={16} /></span>
          <button onClick={() => nav(`/tasks/${t.id}`)} className="min-w-0 text-left"><p className="line-clamp-2 text-[14px] font-bold leading-snug transition-colors group-hover:text-brand">{t.title}</p><p className="text-xxs font-semibold text-faint">{t.code}</p></button></div>
        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11.5px]">
          <span className="inline-flex max-w-full items-center gap-1 rounded-lg bg-subtle px-2 py-1 text-muted"><MapPin size={12} className="shrink-0 text-faint" /><span className="truncate">{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'}</span></span>
          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold ${late ? 'bg-bad/10 text-bad' : 'bg-subtle text-muted'}`}><CalendarClock size={12} />{left(t.deadline)}<span className="font-normal opacity-70">· {fmtDateTime(t.deadline)}</span></span></div>
        <div className="mt-3"><div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted"><span>Progress</span><span className="text-[12px] normal-case tracking-normal text-ink">{t.progress}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-subtle"><div className={`h-full rounded-full bg-gradient-to-r transition-all ${late ? 'from-bad to-warn' : 'from-brand to-vis'}`} style={{ width: `${t.progress}%` }} /></div></div>
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line/60 pt-3 [&>*]:flex-1 [&>*]:justify-center [&>*]:whitespace-nowrap"><TaskActions t={t} size="md" /></div>
      </div> })}
      {!m.active.length && <div className="col-span-full rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line/70"><EmptyState title="No active tasks" text="New assignments will appear here." /></div>}
    </div>
  </>
}
