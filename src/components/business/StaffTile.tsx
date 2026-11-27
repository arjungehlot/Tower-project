import { Phone, Mail, Clock, MapPin, CalendarDays, ShieldCheck, ClipboardList, CheckCircle2, AlertTriangle, CircleCheck, Briefcase, Coffee, Moon, UserX, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Avatar, Stars } from '@/components/ui'
import { fmtDate } from '@/utils/dateUtils'
import type { Employee, Task } from '@/types'

const ST: Record<string, { i: LucideIcon; c: string; l: string }> = {
  AVAILABLE: { i: CircleCheck, c: 'bg-ok/10 text-ok', l: 'Available' }, BUSY: { i: Briefcase, c: 'bg-info/10 text-info', l: 'Busy' },
  ON_BREAK: { i: Coffee, c: 'bg-warn/10 text-warn', l: 'On break' }, OFF_DUTY: { i: Moon, c: 'bg-subtle text-muted', l: 'Off duty' }, ABSENT: { i: UserX, c: 'bg-bad/10 text-bad', l: 'Absent' },
}
const ACTIVE = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD']

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) { return <p className="flex items-center gap-2 truncate text-[12px] text-muted"><span className="shrink-0 text-faint">{icon}</span><span className="truncate">{children}</span></p> }
function Stat({ icon, v, k, tone }: { icon: ReactNode; v: ReactNode; k: string; tone?: string }) {
  return <div className="flex flex-col items-center gap-0.5 px-1 py-1.5"><span className={tone ?? 'text-faint'}>{icon}</span><p className="text-[15px] font-bold leading-none">{v}</p><p className="text-[9px] font-semibold uppercase tracking-wider text-muted">{k}</p></div>
}

/** Full-detail staff / supervisor card used by the card view of Staff Management. */
export function StaffTile({ e, tasks, supervisor, menu, onClick }: { e: Employee; tasks: Task[]; supervisor?: Employee; menu?: ReactNode; onClick?: () => void }) {
  const mine = tasks.filter((t) => t.assignedEmployeeId === e.id), act = mine.filter((t) => ACTIVE.includes(t.status)), done = mine.filter((t) => t.status === 'COMPLETED'), late = act.filter((t) => new Date(t.deadline) < new Date())
  const st = ST[e.status] ?? ST.OFF_DUTY, SI = st.i, att = Math.round(e.attendance ?? 0)
  return (
    <div className="group flex flex-col rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line/70 transition-all hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-start gap-3">
        <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <Avatar name={e.name} src={e.photo} size={46} />
          <div className="min-w-0 leading-tight"><p className="truncate text-[14px] font-bold group-hover:text-brand">{e.name}</p><p className="mt-0.5 text-xxs font-semibold text-brand">{e.empId}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><Stars value={e.rating || 0} size={10} />{e.rating ? e.rating.toFixed(1) : 'No rating'}</p></div>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1.5">{menu}<span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-0.5 text-[10.5px] font-semibold ${st.c}`}><SI size={11} />{st.l}</span></div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5"><span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">{e.category}</span><span className="inline-flex items-center gap-1 rounded-md bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted"><Clock size={11} />{e.shift} shift</span></div>
      <div className="mt-2.5 space-y-1.5">
        <Row icon={<Phone size={12} />}>{e.phone}</Row><Row icon={<Mail size={12} />}>{e.email}</Row>
        <Row icon={<MapPin size={12} />}>{e.location || '—'}</Row>
        {supervisor && <Row icon={<ShieldCheck size={12} />}>Supervisor: <b className="font-semibold text-ink">{supervisor.name}</b></Row>}
        <Row icon={<CalendarDays size={12} />}>Joined {fmtDate(e.joiningDate)}</Row>
      </div>
      <div className="mt-2.5 grid grid-cols-4 divide-x divide-line rounded-xl bg-subtle/70">
        <Stat icon={<ClipboardList size={13} />} v={act.length} k="Active" tone="text-info" /><Stat icon={<CheckCircle2 size={13} />} v={done.length} k="Done" tone="text-ok" />
        <Stat icon={<AlertTriangle size={13} />} v={late.length} k="Overdue" tone={late.length ? 'text-bad' : 'text-faint'} /><Stat icon={<CircleCheck size={13} />} v={`${att}%`} k="Attend." tone="text-brand" /></div>
      {e.skills?.length > 0 && <div className="mt-2.5 flex flex-wrap gap-1">{e.skills.slice(0, 4).map((k) => <span key={k} className="rounded-md border border-line px-1.5 py-px text-[10px] font-medium text-muted">{k}</span>)}{e.skills.length > 4 && <span className="rounded-md px-1 py-px text-[10px] text-faint">+{e.skills.length - 4}</span>}</div>}
    </div>
  )
}
