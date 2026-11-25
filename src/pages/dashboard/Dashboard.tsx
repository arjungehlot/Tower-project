import { useNavigate, Link } from 'react-router-dom'
import { Building, UserRoundCheck, Users, LogOut, Ticket, UserCheck, HardHat, ShieldQuestion, AlertTriangle, CalendarClock, IndianRupee, Check } from 'lucide-react'
import { Avatar, Badge, Card, PageHeader, ProgressBar, StatCard, StatusBadge } from '@/components/ui'
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
    <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Total offices" value={os.total} icon={<Building size={15} />} sub={`${os.occupied} occupied · ${os.vacant} vacant`} trend={Math.round((os.occupied / os.total) * 100) - 70} onClick={() => nav('/offices')} />
      <StatCard label="Visitors today" value={vs.total} icon={<UserRoundCheck size={15} />} tone="vis" spark={sp} sub="vs 7-day trend" trend={8} onClick={() => nav('/visitors')} />
      <StatCard label="Currently inside" value={vs.inside} icon={<Users size={15} />} tone="info" sub="Live" onClick={() => nav('/visitors/live')} />
      <StatCard label="Exited today" value={vs.exited} icon={<LogOut size={15} />} sub={`${vs.entered} entered`} />
      <StatCard label="Open tickets" value={ts.active} icon={<Ticket size={15} />} tone="warn" sub={`${ts.critical} critical · ${ts.overdue} overdue`} onClick={() => nav('/tickets')} />
      <StatCard label="Available staff" value={es.available} icon={<UserCheck size={15} />} tone="ok" sub={`${es.busy} busy`} onClick={() => nav('/staff/availability')} />
      <StatCard label="Active staff" value={es.active} icon={<HardHat size={15} />} sub={`of ${es.total} registered`} />
      <StatCard label="Pending approvals" value={pending.length} icon={<ShieldQuestion size={15} />} tone="warn" sub={`${tk.toVerify} tasks to verify`} onClick={() => nav('/visitors/live')} />
    </div>
    <div className="grid items-start gap-3 xl:grid-cols-3">
      <div className="xl:col-span-2"><BuildingViz /></div>
      <Card title="Live visitor monitor" action={<Link to="/visitors/live" className="text-xxs font-medium text-brand">View all</Link>} pad={false}>
        <div className="max-h-[400px] space-y-1.5 overflow-y-auto p-2">{inside.slice(0, 6).map((v) => <VisitorCard key={v.id} v={v} showDuration onClick={() => nav(`/visitors/${v.id}`)} />)}{pending.slice(0, 3).map((v) => <VisitorCard key={v.id} v={v} onClick={() => nav(`/visitors/${v.id}`)} actions={<VisitorActions v={v} size="xs" />} />)}{!inside.length && !pending.length && <p className="p-6 text-center text-xs text-muted">No active visitors.</p>}</div>
      </Card>
    </div>
    <div className="mt-3 grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Building occupancy"><div className="flex items-end justify-between"><div><p className="text-2xl font-bold">{totalIn}</p><p className="text-xxs text-muted">of {cap.toLocaleString('en-IN')} capacity</p></div><Badge tone="brand">{Math.round((totalIn / cap) * 100)}%</Badge></div><ProgressBar className="mt-2" value={(totalIn / cap) * 100} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div><p className="font-bold">{empIn}</p><p className="text-xxs text-muted">Employees</p></div><div><p className="font-bold text-info">{inside.length}</p><p className="text-xxs text-muted">Visitors</p></div><div><p className="font-bold">{vs.exited}</p><p className="text-xxs text-muted">Exited</p></div></div></Card>
      <Card title="Entries vs exits today"><LineSeries data={hours} keys={['Entries', 'Exits']} h={150} /></Card>
      <Card title="Ticket status"><Donut data={ticketStatus} h={170} /></Card>
      <Card title="Alerts" action={<AlertTriangle size={14} className="text-warn" />}><ul className="space-y-2">{alerts.map((a) => <li key={a.id}><Link to={a.to} className="flex items-start gap-2 text-xs hover:text-brand"><Badge tone={a.tone}>{a.tone === 'red' ? 'Critical' : 'Attention'}</Badge><span>{a.text}</span></Link></li>)}{!alerts.length && <p className="text-xs text-muted">No active alerts.</p>}</ul></Card>
      <ActivityFeed />
      <Card title="Recent approvals"><ul className="space-y-2.5">{recentApprovals.map((v) => <li key={v.id} className="flex items-center gap-2"><Avatar name={v.name} src={v.photo} size={26} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{v.name}</p><p className="text-xxs text-muted">Office {L.officeNo(v.officeId)} · {fmtTime(v.approvedAt)}</p></div><Check size={13} className="text-ok" /></li>)}</ul></Card>
      <Card title="Upcoming maintenance" action={<CalendarClock size={14} className="text-muted" />}><ul className="space-y-2">{upcoming.map((m) => { const d = daysUntil(m.nextDue); return <li key={m.id} className="flex items-center justify-between text-xs"><span>{m.title}<span className="block text-xxs text-muted">{m.frequency}</span></span><Badge tone={d < 0 ? 'red' : d < 7 ? 'orange' : 'blue'}>{d < 0 ? `${-d}d overdue` : `in ${d}d`}</Badge></li> })}</ul></Card>
      {isAdmin && <Card title="Rent overview" action={<IndianRupee size={14} className="text-muted" />}><p className="text-2xl font-bold">{currency(rent)}</p><p className="text-xxs text-muted">Monthly rent roll · {os.occupied} paying offices</p><div className="mt-3"><Bars data={s.towers.map((t) => ({ name: t.name, value: Math.round(offices.filter((o) => o.towerId === t.id && o.status === 'Occupied').reduce((a, o) => a + o.rent, 0) / 1000) }))} h={120} /></div><p className="text-center text-xxs text-muted">₹ thousands per month</p></Card>}
      <Card title="Staff availability"><div className="space-y-2">{[['Available', es.available, 'ok'], ['Busy', es.busy, 'info'], ['On break', es.onBreak, 'warn'], ['Off duty / absent', es.offDuty + es.absent, 'bad']].map(([l, n, t]) => <div key={l as string}><div className="flex justify-between text-xs"><span>{l}</span><b>{n}</b></div><ProgressBar value={((n as number) / es.total) * 100} tone={t as 'ok'} /></div>)}</div></Card>
    </div>
    <p className="sr-only"><StatusBadge status="OPEN" />{today.length}</p>
  </>
}
