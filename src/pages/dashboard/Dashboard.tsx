import { useNavigate, Link } from 'react-router-dom'
import { Building, UserRoundCheck, Users, LogOut, Ticket, UserCheck, HardHat, ShieldQuestion, AlertTriangle, CalendarClock, IndianRupee, Check, ChevronRight } from 'lucide-react'
import { Avatar, Badge, Card, PageHeader, ProgressBar, StatusBadge } from '@/components/ui'
import { BuildingViz } from '@/components/business/BuildingViz'
import { ActivityFeed } from '@/components/business/ActivityFeed'
import { VisitorCard } from '@/components/business/VisitorCard'
import { VisitorActions } from '@/components/business/VisitorActions'
import { Bars, Donut, LineSeries } from '@/components/charts'
import { useDb } from '@/store/db'
import { useVisitors } from '@/hooks/useVisitors'
import { useTickets } from '@/hooks/useTickets'
import { useEmployees } from '@/hooks/useEmployees'
import { useOffices } from '@/hooks/useOffices'
import { useTasks } from '@/hooks/useTasks'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import { currency } from '@/utils/constants'
import { daysUntil, fmtTime, isToday, dayKey } from '@/utils/dateUtils'
import { countBy } from '@/utils/helpers'

const GO: Record<string, string> = { 'Total offices': '/offices', 'Visitors today': '/visitors', 'Inside now': '/visitors/live', 'Exited today': '/visitors', 'Open tickets': '/tickets', 'Available staff': '/staff', 'Active staff': '/staff', Approvals: '/visitors' }
const spark = (dates: string[]) => [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10); return dates.filter((x) => x && dayKey(x) === d).length })
export default function Dashboard() {
  const nav = useNavigate(), L = useLookups(), { me } = useMe(), s = useDb()
  const { visitors, today, inside, pending, stats: vs } = useVisitors(), { stats: ts } = useTickets(), { stats: es } = useEmployees(), { stats: os, offices } = useOffices(), { stats: tk } = useTasks()
  const sp = spark(visitors.map((v) => v.requestedAt)), isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(me?.role ?? '')
  const hours = [...Array(12)].map((_, i) => 8 + i).map((h) => ({ name: `${h}:00`, Entries: visitors.filter((v) => isToday(v.entryAt) && new Date(v.entryAt).getHours() === h).length, Exits: visitors.filter((v) => isToday(v.exitAt) && new Date(v.exitAt).getHours() === h).length }))
  const cap = s.buildings[0].capacity, empIn = Math.round(os.occupied * 5.4), totalIn = empIn + inside.length
  const alerts = [...s.tickets.filter((t) => t.priority === 'CRITICAL' && !['CLOSED', 'RESOLVED'].includes(t.status)).map((t) => ({ id: t.id, text: `Critical ticket ${t.code}: ${t.subject}`, to: `/tickets/${t.id}`, tone: 'red' as const })),
    ...offices.filter((o) => o.tenantId && daysUntil(o.leaseEnd) >= 0 && daysUntil(o.leaseEnd) < 30).slice(0, 2).map((o) => ({ id: o.id, text: `Lease for Office ${o.number} expires in ${daysUntil(o.leaseEnd)} days`, to: `/offices/${o.id}`, tone: 'orange' as const })),
    ...s.assets.filter((a) => a.status !== 'Operational').slice(0, 2).map((a) => ({ id: a.id, text: `${a.name}: ${a.status}`, to: '/assets', tone: 'orange' as const }))].slice(0, 6)
  const rent = offices.filter((o) => o.status === 'Occupied').reduce((a, o) => a + o.rent, 0)
  const recentApprovals = [...s.visitors].filter((v) => v.approvedAt).sort((a, b) => b.approvedAt.localeCompare(a.approvedAt)).slice(0, 5)
  const upcoming = [...s.maintenance].sort((a, b) => a.nextDue.localeCompare(b.nextDue)).slice(0, 4)
  const ticketStatus = Object.entries(countBy(s.tickets, (t) => t.status)).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
  return <>
    <PageHeader title={`Welcome back, ${me?.name.split(' ')[0]}`} subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Command center`} />
    <div className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-card sm:grid-cols-4 xl:grid-cols-8">
      {([
        ['Total offices', os.total, <Building size={14} />, 'text-brand bg-brand/10', `${os.occupied} occ · ${os.vacant} vacant`, Math.round((os.occupied / os.total) * 100) - 70],
        ['Visitors today', vs.total, <UserRoundCheck size={14} />, 'text-vis bg-vis/10', 'vs 7-day avg', 8],
        ['Inside now', vs.inside, <Users size={14} />, 'text-info bg-info/10', 'Live'],
        ['Exited today', vs.exited, <LogOut size={14} />, 'text-muted bg-subtle', `${vs.entered} entered`],
        ['Open tickets', ts.active, <Ticket size={14} />, 'text-warn bg-warn/10', `${ts.critical} critical · ${ts.overdue} overdue`],
        ['Available staff', es.available, <UserCheck size={14} />, 'text-ok bg-ok/10', `${es.busy} busy`],
        ['Active staff', es.active, <HardHat size={14} />, 'text-brand bg-brand/10', `of ${es.total} registered`],
        ['Approvals', pending.length, <ShieldQuestion size={14} />, 'text-warn bg-warn/10', `${tk.toVerify} to verify`],
      ] as [string, number, React.ReactNode, string, string, number?][]).map(([l, v, ic, tc, sub, tr]) => <Link key={l} to={GO[l]} className="group min-w-0 bg-surface px-3 py-2.5 transition-colors hover:bg-brand-soft/60 focus-visible:bg-brand-soft/60 focus-visible:outline-none">
        <div className="flex items-center justify-between gap-1"><span className="truncate text-[10.5px] font-medium uppercase tracking-wide text-muted">{l}</span><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${tc}`}>{ic}</span></div>
        <p className="mt-1 flex items-baseline gap-1.5 text-xl font-semibold leading-none tabular-nums">{v}{tr !== undefined && <span className={`text-[10.5px] font-medium ${tr >= 0 ? 'text-ok' : 'text-bad'}`}>{tr >= 0 ? '+' : ''}{tr}%</span>}</p>
        <p className="mt-1 truncate text-[11px] text-muted">{sub}</p>
      </Link>)}
    </div>
    <div className="grid items-stretch gap-3 xl:grid-cols-3">
      <div className="xl:col-span-2 xl:h-full"><BuildingViz /></div>
      <Card title="Live visitor monitor" action={<Link to="/visitors/live" className="text-xxs font-medium text-brand">View all</Link>} className="xl:relative xl:h-full" pad={false}>
        <div><div className="max-h-[400px] space-y-1.5 overflow-y-auto p-2 xl:absolute xl:inset-x-0 xl:bottom-0 xl:top-[37px] xl:max-h-none">{inside.slice(0, 6).map((v) => <VisitorCard key={v.id} v={v} showDuration onClick={() => nav(`/visitors/${v.id}`)} />)}{pending.slice(0, 3).map((v) => <VisitorCard key={v.id} v={v} onClick={() => nav(`/visitors/${v.id}`)} actions={<VisitorActions v={v} size="xs" />} />)}{!inside.length && !pending.length && <p className="p-6 text-center text-xs text-muted">No active visitors.</p>}</div></div>
      </Card>
    </div>
    <div className="mt-3 grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Building occupancy"><div className="flex items-end justify-between"><div><p className="text-xl font-semibold">{totalIn}</p><p className="text-xxs text-muted">of {cap.toLocaleString('en-IN')} capacity</p></div><Badge tone="brand">{Math.round((totalIn / cap) * 100)}%</Badge></div><ProgressBar className="mt-2" value={(totalIn / cap) * 100} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div><p className="font-bold">{empIn}</p><p className="text-xxs text-muted">Employees</p></div><div><p className="font-bold text-info">{inside.length}</p><p className="text-xxs text-muted">Visitors</p></div><div><p className="font-bold">{vs.exited}</p><p className="text-xxs text-muted">Exited</p></div></div></Card>
      <Card title="Entries vs exits today"><LineSeries data={hours} keys={['Entries', 'Exits']} h={130} /></Card>
      <Card title="Ticket status"><Donut data={ticketStatus} h={140} /></Card>
      <Card title="Alerts" action={<span className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2 py-0.5 text-[10.5px] font-semibold text-warn"><AlertTriangle size={11} />{alerts.length}</span>} pad={false}>
        <ul className="max-h-[300px] space-y-1.5 overflow-y-auto p-2">{alerts.map((a) => { const [head, ...rest] = a.text.split(': '), code = head.replace('Critical ticket ', ''), crit = a.tone === 'red'; return <li key={a.id}><Link to={a.to} className={`group flex items-center gap-2.5 rounded-lg border border-l-[3px] bg-surface px-2.5 py-1.5 transition-all hover:-translate-y-px hover:shadow-card ${crit ? 'border-bad/20 border-l-bad' : 'border-warn/20 border-l-warn'}`}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${crit ? 'bg-bad/15 text-bad' : 'bg-warn/15 text-warn'}`}><AlertTriangle size={14} /></span>
          <span className="min-w-0 flex-1 leading-tight"><span className="flex items-center gap-1.5"><span className="text-[10.5px] font-bold tracking-wide text-muted">{code}</span><span className={`rounded px-1 py-px text-[9px] font-bold uppercase ${crit ? 'bg-bad/15 text-bad' : 'bg-warn/15 text-warn'}`}>{crit ? 'Critical' : 'Attention'}</span></span><span className="block truncate text-xs font-medium group-hover:text-brand">{rest.join(': ') || a.text}</span></span>
          <ChevronRight size={14} className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand" /></Link></li> })}{!alerts.length && <li className="py-6 text-center text-xs text-muted">No active alerts.</li>}</ul></Card>
      <ActivityFeed />
      <Card title="Recent approvals" action={<span className="rounded-full bg-ok/15 px-2 py-0.5 text-[10.5px] font-semibold text-ok">{recentApprovals.length} today</span>} pad={false}>
        <ul className="space-y-1.5 p-2">{recentApprovals.map((v) => <li key={v.id} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-1.5 transition-colors hover:bg-subtle/60"><Avatar name={v.name} src={v.photo} size={30} /><div className="min-w-0 flex-1 leading-tight"><p className="truncate text-xs font-semibold">{v.name}</p><p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted"><span className="rounded bg-subtle px-1 py-px font-semibold">Office {L.officeNo(v.officeId)}</span>{fmtTime(v.approvedAt)}</p></div><span className="inline-flex items-center gap-1 rounded-full border border-ok/50 bg-ok/20 px-1.5 py-0.5 text-[10px] font-semibold text-ok"><Check size={11} />Approved</span></li>)}</ul></Card>
      <Card title="Upcoming maintenance" action={<CalendarClock size={14} className="text-muted" />}><ul className="space-y-2">{upcoming.map((m) => { const d = daysUntil(m.nextDue); return <li key={m.id} className="flex items-center justify-between text-xs"><span>{m.title}<span className="block text-xxs text-muted">{m.frequency}</span></span><Badge tone={d < 0 ? 'red' : d < 7 ? 'orange' : 'blue'}>{d < 0 ? `${-d}d overdue` : `in ${d}d`}</Badge></li> })}</ul></Card>
      {isAdmin && <Card title="Rent overview" action={<IndianRupee size={14} className="text-muted" />}><p className="text-xl font-semibold">{currency(rent)}</p><p className="text-xxs text-muted">Monthly rent roll · {os.occupied} paying offices</p><div className="mt-3"><Bars data={s.towers.map((t) => ({ name: t.name, value: Math.round(offices.filter((o) => o.towerId === t.id && o.status === 'Occupied').reduce((a, o) => a + o.rent, 0) / 1000) }))} h={120} /></div><p className="text-center text-xxs text-muted">₹ thousands per month</p></Card>}
      <Card title="Staff availability"><div className="space-y-2">{[['Available', es.available, 'ok'], ['Busy', es.busy, 'info'], ['On break', es.onBreak, 'warn'], ['Off duty / absent', es.offDuty + es.absent, 'bad']].map(([l, n, t]) => <div key={l as string}><div className="flex justify-between text-xs"><span>{l}</span><b>{n}</b></div><ProgressBar value={((n as number) / es.total) * 100} tone={t as 'ok'} /></div>)}</div></Card>
    </div>
    <p className="sr-only"><StatusBadge status="OPEN" />{today.length}</p>
  </>
}
