import { useNavigate } from 'react-router-dom'
import { UserPlus, Ticket, Clock, CalendarCheck, Users, Bell, Building2, MapPin, DoorOpen, CircleDot, UserCheck, Loader, PauseCircle, CheckCircle2, Lock, ChevronRight, type LucideIcon } from 'lucide-react'
import { Card, EmptyState, StatCard } from '@/components/ui'
import { VisitorCard } from '@/components/business/VisitorCard'
import { VisitorActions } from '@/components/business/VisitorActions'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { visibleTo } from '@/services/notificationService'
import { ago, isToday } from '@/utils/dateUtils'

const ST: Record<string, { i: LucideIcon; c: string; l: string }> = {
  OPEN: { i: CircleDot, c: 'bg-info/10 text-info', l: 'Open' }, ASSIGNED: { i: UserCheck, c: 'bg-warn/10 text-warn', l: 'Assigned' }, IN_PROGRESS: { i: Loader, c: 'bg-brand/10 text-brand', l: 'In progress' },
  WAITING: { i: PauseCircle, c: 'bg-vis/10 text-vis', l: 'Waiting' }, RESOLVED: { i: CheckCircle2, c: 'bg-ok/10 text-ok', l: 'Resolved' }, CLOSED: { i: Lock, c: 'bg-subtle text-muted', l: 'Closed' },
}
const Count = ({ n, tone = 'bg-subtle text-muted' }: { n: number; tone?: string }) => <span className={`rounded-full px-2 py-0.5 text-xxs font-bold ${tone}`}>{n}</span>
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export default function OfficeDashboard() {
  const nav = useNavigate(), { me, officeId } = useMe(), L = useLookups(), { visitors, tickets, notifications } = useDb()
  const o = L.office(officeId), mine = visitors.filter((v) => v.officeId === officeId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  const waiting = mine.filter((v) => v.status === 'PENDING' || v.status === 'INFO_REQUESTED'), upcoming = mine.filter((v) => v.status === 'APPROVED'), inside = mine.filter((v) => v.status === 'INSIDE')
  const tk = tickets.filter((t) => t.officeId === officeId), openTk = tk.filter((t) => !['CLOSED'].includes(t.status)), notes = notifications.filter((n) => visibleTo(n, me)).slice(0, 5)
  return <>
    <div className="relative mb-3 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-soft via-brand-soft/40 to-surface px-5 py-4 shadow-card ring-1 ring-line/70">
      <span className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand/5" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-medium text-muted">{greet()}</p><h1 className="text-xl font-bold leading-tight tracking-tight">Hello, {me?.name.split(' ')[0]} 👋</h1>
          {o && <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px] font-medium"><span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><DoorOpen size={12} className="text-brand" />Office {o.number}</span><span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><Building2 size={12} className="text-brand" />{L.tenant(o.tenantId)?.name}</span><span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-line"><MapPin size={12} className="text-brand" />{L.location(o.towerId, o.floorId)}</span></div>}</div>
        <div className="flex items-center gap-2"><button onClick={() => nav('/tickets?new=1')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand"><Ticket size={14} />Raise ticket</button>
          <button onClick={() => nav('/visitor/register')} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] dark:text-slate-900"><UserPlus size={14} />Invite visitor</button></div>
      </div>
    </div>
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Visitors waiting" value={waiting.length} icon={<Clock size={15} />} tone="warn" /><StatCard label="Upcoming / approved" value={upcoming.length} icon={<CalendarCheck size={15} />} tone="ok" /><StatCard label="Visitors inside" value={inside.length} icon={<Users size={15} />} tone="info" /><StatCard label="Open tickets" value={openTk.length} icon={<Ticket size={15} />} tone="vis" /></div>
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title="Visitors waiting for you" action={<Count n={waiting.length} tone={waiting.length ? 'bg-warn/15 text-warn' : undefined} />} pad={false}><div className="grid gap-2.5 p-3 sm:grid-cols-2 2xl:grid-cols-3">{waiting.map((v) => <VisitorCard tile key={v.id} v={v} onClick={() => nav(`/visitors/${v.id}`)} actions={<VisitorActions v={v} size="md" />} />)}{!waiting.length && <div className="col-span-full"><EmptyState title="No visitors waiting" text="Approval requests from the gate appear here instantly." /></div>}</div></Card>
        <Card title="My visitors today" action={<Count n={mine.filter((v) => isToday(v.requestedAt) && !waiting.includes(v)).length} />} pad={false}><div className="grid gap-2.5 p-3 sm:grid-cols-2 2xl:grid-cols-3">{mine.filter((v) => isToday(v.requestedAt) && !waiting.includes(v)).map((v) => <VisitorCard tile key={v.id} v={v} showDuration onClick={() => nav(`/visitors/${v.id}`)} />)}{!mine.some((v) => isToday(v.requestedAt) && !waiting.includes(v)) && <p className="col-span-full p-4 text-center text-xs text-muted">No other visitors today.</p>}</div></Card>
      </div>
      <div className="space-y-3">
        <Card title="Ticket status" action={<button className="inline-flex items-center gap-0.5 text-xxs font-semibold text-brand hover:underline" onClick={() => nav('/tickets/mine')}>View all<ChevronRight size={12} /></button>} pad={false}>
          <ul className="divide-y divide-line/60">{tk.slice(0, 5).map((t) => { const m = ST[t.status] ?? ST.OPEN, I = m.i; return <li key={t.id}><button onClick={() => nav(`/tickets/${t.id}`)} className="group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-subtle/60"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${m.c}`}><I size={13} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-medium group-hover:text-brand">{t.subject}</span><span className="text-xxs text-muted"><b className="text-brand">{t.code}</b> · {ago(t.createdAt)}</span></span><span className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${m.c}`}>{m.l}</span></button></li> })}{!tk.length && <li className="p-4 text-center text-xs text-muted">No tickets raised.</li>}</ul></Card>
        <Card title="Recent notifications" action={<Bell size={14} className="text-muted" />} pad={false}>
          <ul className="divide-y divide-line/60">{notes.map((n) => <li key={n.id} className="flex items-start gap-2.5 px-3 py-2"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"><Bell size={13} /></span><div className="min-w-0"><p className="truncate text-[12.5px] font-medium">{n.title}</p><p className="line-clamp-2 text-xxs text-muted">{n.body}</p><p className="mt-0.5 text-[10px] text-faint">{ago(n.createdAt)}</p></div></li>)}{!notes.length && <li className="flex flex-col items-center gap-1 p-5 text-center"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-faint"><Bell size={15} /></span><p className="text-xs text-muted">You’re all caught up</p></li>}</ul></Card>
      </div>
    </div></>
}
