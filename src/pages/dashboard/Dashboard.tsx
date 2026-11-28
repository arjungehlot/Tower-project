import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building, UserRoundCheck, Users, LogOut, Ticket, UserCheck, HardHat, ShieldQuestion, AlertTriangle, CalendarClock, IndianRupee, Check, ChevronRight, LayoutDashboard, RefreshCw } from 'lucide-react'
import { Avatar, Badge, Card, ProgressBar, Select, StatusBadge } from '@/components/ui'
import { BuildingViz } from '@/components/business/BuildingViz'
import { ActivityFeed } from '@/components/business/ActivityFeed'
import { LiveDuration } from '@/components/business/VisitorCard'
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
  const [range, setRange] = useState('today'), [spin, setSpin] = useState(false), [updated, setUpdated] = useState(() => new Date().toISOString()), nav = useNavigate(), L = useLookups(), { me } = useMe(), s = useDb()
  const { visitors, today, inside, pending, stats: vs } = useVisitors(), { stats: ts, tickets: tkAll } = useTickets(), { stats: es } = useEmployees(), { stats: os, offices } = useOffices(), { stats: tk } = useTasks()
  const sp = spark(visitors.map((v) => v.requestedAt)), isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(me?.role ?? '')
  const hourly = [...Array(12)].map((_, i) => 8 + i).map((h) => ({ name: `${h}:00`, Entries: visitors.filter((v) => isToday(v.entryAt) && new Date(v.entryAt).getHours() === h).length, Exits: visitors.filter((v) => isToday(v.exitAt) && new Date(v.exitAt).getHours() === h).length }))
  const days = range === 'today' ? 0 : range === 'yesterday' ? 1 : range === '7d' ? 7 : 30
  const daily = days <= 1 ? [] : [...Array(days)].map((_, i) => { const d = new Date(Date.now() - (days - 1 - i) * 86400000), k = d.toISOString().slice(0, 10); return { name: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), Entries: visitors.filter((v) => v.entryAt && dayKey(v.entryAt) === k).length, Exits: visitors.filter((v) => v.exitAt && dayKey(v.exitAt) === k).length } })
  const yk = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const yest = [...Array(12)].map((_, i) => 8 + i).map((h) => ({ name: `${h}:00`, Entries: visitors.filter((v) => v.entryAt && dayKey(v.entryAt) === yk && new Date(v.entryAt).getHours() === h).length, Exits: visitors.filter((v) => v.exitAt && dayKey(v.exitAt) === yk && new Date(v.exitAt).getHours() === h).length }))
  const hours = range === 'today' ? hourly : range === 'yesterday' ? yest : daily
  const refresh = () => { setSpin(true); setUpdated(new Date().toISOString()); setTimeout(() => setSpin(false), 700); s.toast('Dashboard refreshed', 'info') }
  const cap = s.buildings[0].capacity, empIn = Math.round(os.occupied * 5.4), totalIn = empIn + inside.length
  const alerts = [...tkAll.filter((t) => t.priority === 'CRITICAL' && !['CLOSED', 'RESOLVED'].includes(t.status)).map((t) => ({ id: t.id, text: `Critical ticket ${t.code}: ${t.subject}`, to: `/tickets/${t.id}`, tone: 'red' as const })),
    ...offices.filter((o) => o.tenantId && daysUntil(o.leaseEnd) >= 0 && daysUntil(o.leaseEnd) < 30).slice(0, 2).map((o) => ({ id: o.id, text: `Lease for Office ${o.number} expires in ${daysUntil(o.leaseEnd)} days`, to: `/offices/${o.id}`, tone: 'orange' as const })),
    ...s.assets.filter((a) => a.status !== 'Operational').slice(0, 2).map((a) => ({ id: a.id, text: `${a.name}: ${a.status}`, to: '/assets', tone: 'orange' as const }))].slice(0, 4)
  const rent = offices.filter((o) => o.status === 'Occupied').reduce((a, o) => a + o.rent, 0)
  const recentApprovals = [...s.visitors].filter((v) => v.approvedAt).sort((a, b) => b.approvedAt.localeCompare(a.approvedAt)).slice(0, 5)
  const upcoming = [...s.maintenance].sort((a, b) => a.nextDue.localeCompare(b.nextDue)).slice(0, 4)
  const ticketStatus = Object.entries(countBy(tkAll, (t) => t.status)).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
  return <>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><LayoutDashboard size={19} /></span>
        <div><h1 className="text-[17px] font-bold leading-tight tracking-tight">Welcome back, {me?.name.split(' ')[0]}</h1><p className="text-[11.5px] text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Command center</p></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-muted sm:inline">Updated {fmtTime(updated)}</span>
        <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range" className="!h-9 w-[150px] !py-0 text-xs" options={[{ value: 'today', label: 'Today' }, { value: 'yesterday', label: 'Yesterday' }, { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }]} />
        <button onClick={refresh} aria-label="Refresh dashboard" title="Refresh" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-muted shadow-card transition-colors hover:border-brand/40 hover:text-brand"><RefreshCw size={15} className={spin ? 'animate-spin' : ''} /></button>
      </div>
    </div>
    <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {([
        ['Offices', os.total, <Building size={16} />, 'text-brand bg-brand/10', `${os.occupied} occupied · ${os.vacant} vacant`, '/offices', `${Math.round((os.occupied / os.total) * 100)}% occupancy`],
        ['Visitors today', vs.total, <UserRoundCheck size={16} />, 'text-vis bg-vis/10', `${vs.inside} inside right now`, '/visitors', ''],
        ['Open tickets', ts.active, <Ticket size={16} />, 'text-warn bg-warn/10', `${ts.critical} critical · ${ts.overdue} overdue`, '/tickets', ''],
        ['Staff available', es.available, <UserCheck size={16} />, 'text-ok bg-ok/10', `${es.busy} busy · ${es.total} total`, '/staff', ''],
      ] as [string, number, React.ReactNode, string, string, string, string][]).map(([l, v, ic, tc, sub, to, chip]) => <Link key={l} to={to} className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tc}`}>{ic}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-[11px] text-muted">{l}</p><p className="text-xl font-semibold leading-tight tabular-nums">{v}</p><p className="truncate text-[11px] text-muted">{sub}</p></div>
        {chip && <span className="hidden self-start rounded-full bg-ok/10 px-2 py-0.5 text-[10.5px] font-medium text-ok xl:inline">{chip}</span>}
      </Link>)}
    </div>
    <div className="grid items-stretch gap-3 xl:grid-cols-3">
      <div className="xl:col-span-2 xl:h-full"><BuildingViz /></div>
      <Card title="Live visitor monitor" action={<Link to="/visitors/live" className="text-xxs font-medium text-brand">View all</Link>} className="xl:relative xl:h-full" pad={false}>
        <div className="max-h-[400px] overflow-auto xl:absolute xl:inset-x-0 xl:bottom-0 xl:top-[37px] xl:max-h-none">
          <table className="w-full text-xs"><thead className="sticky top-0 z-10 bg-surface"><tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-muted"><th className="px-3 py-2 font-semibold">Visitor</th><th className="px-2 py-2 font-semibold">Office</th><th className="hidden px-2 py-2 font-semibold 2xl:table-cell">Purpose</th><th className="px-3 py-2 text-right font-semibold">Status</th></tr></thead>
            <tbody className="divide-y divide-line/60">{[...inside.slice(0, 7), ...pending.slice(0, 3)].map((v) => <tr key={v.id} onClick={() => nav(`/visitors/${v.id}`)} className="cursor-pointer transition-colors hover:bg-subtle/60">
              <td className="px-3 py-1.5"><span className="flex items-center gap-2 whitespace-nowrap"><Avatar name={v.name} src={v.photo} size={22} />{v.name}</span></td>
              <td className="whitespace-nowrap px-2 py-1.5 text-muted">{L.officeNo(v.officeId)}</td>
              <td className="hidden whitespace-nowrap px-2 py-1.5 text-muted 2xl:table-cell">{v.purpose}</td>
              <td className="whitespace-nowrap px-3 py-1.5 text-right">{v.status === 'INSIDE' ? <span className="text-info"><LiveDuration from={v.entryAt} /></span> : <span onClick={(e) => e.stopPropagation()} className="inline-flex"><span className="inline-flex gap-1"><VisitorActions v={v} soft /></span></span>}</td></tr>)}</tbody></table>
          {!inside.length && !pending.length && <p className="p-6 text-center text-xs text-muted">No active visitors.</p>}</div>
      </Card>
    </div>
    <div className="mt-3 grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4 xl:h-[27dvh] xl:min-h-[190px]">
      <Card title={`Entries vs exits · ${({ today: 'today', yesterday: 'yesterday', '7d': 'last 7 days', '30d': 'last 30 days' } as Record<string, string>)[range]}`}><LineSeries data={hours} keys={['Entries', 'Exits']} h={118} /></Card>
      <Card title="Ticket status" action={<Link to="/tickets" className="text-xxs font-medium text-brand">View all</Link>}>
        {(() => { const ORDER: [string, string, string, string][] = [['OPEN', 'Open', 'stroke-info', 'bg-info'], ['ASSIGNED', 'Assigned', 'stroke-brand', 'bg-brand'], ['IN_PROGRESS', 'In progress', 'stroke-warn', 'bg-warn'], ['WAITING', 'Waiting', 'stroke-vis', 'bg-vis'], ['RESOLVED', 'Resolved', 'stroke-ok', 'bg-ok'], ['CLOSED', 'Closed', 'stroke-faint', 'bg-faint']], cnt = countBy(tkAll, (t) => t.status), tot = tkAll.length || 1, R = 38, C = 2 * Math.PI * R; let off = 0
          return <div className="flex items-center gap-4">
            <div className="relative h-[104px] w-[104px] shrink-0"><svg viewBox="0 0 100 100" className="h-full w-full -rotate-90"><circle cx="50" cy="50" r={R} fill="none" strokeWidth="10" className="stroke-subtle" />
              {ORDER.map(([k, , st]) => { const n = cnt[k] ?? 0, len = (n / tot) * C, el = n ? <circle key={k} cx="50" cy="50" r={R} fill="none" strokeWidth="10" strokeDasharray={`${Math.max(len - 1.5, 0)} ${C}`} strokeDashoffset={-off} className={st} /> : null; off += len; return el })}</svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none"><span className="text-xl font-semibold tabular-nums">{tkAll.length}</span><span className="mt-0.5 text-[10px] text-muted">tickets</span></div></div>
            <ul className="min-w-0 flex-1 space-y-1">{ORDER.map(([k, l, , bg]) => <li key={k} className="flex items-center gap-2 text-xs"><span className={`h-2 w-2 shrink-0 rounded-full ${bg}`} /><span className="flex-1 truncate text-muted">{l}</span><span className="font-medium tabular-nums">{cnt[k] ?? 0}</span></li>)}</ul>
          </div> })()}
      </Card>
      <Card title="Alerts" action={<span className="inline-flex items-center gap-1 rounded-full bg-warn/10 px-2 py-0.5 text-[10.5px] font-medium text-warn">{alerts.length} active</span>} pad={false}>
        <div className="max-h-[300px] overflow-auto xl:max-h-[calc(27dvh-38px)]"><table className="w-full text-xs"><thead className="sticky top-0 bg-surface"><tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-muted"><th className="px-3 py-2 font-semibold">Ref</th><th className="px-2 py-2 font-semibold">Issue</th><th className="px-3 py-2 text-right font-semibold">Level</th></tr></thead>
          <tbody className="divide-y divide-line/60">{alerts.map((a) => { const [head, ...rest] = a.text.split(': '), isT = rest.length > 0 && head.startsWith('Critical ticket'), crit = a.tone === 'red'; return <tr key={a.id} onClick={() => nav(a.to)} className="cursor-pointer transition-colors hover:bg-subtle/60"><td className="whitespace-nowrap px-3 py-1.5 text-muted">{isT ? head.replace('Critical ticket ', '') : a.to.includes('offices') ? 'Lease' : 'Asset'}</td><td className="max-w-[160px] truncate px-2 py-1.5">{isT ? rest.join(': ') : a.text}</td><td className={`whitespace-nowrap px-3 py-1.5 text-right ${crit ? 'text-bad' : 'text-warn'}`}>{crit ? 'Critical' : 'Attention'}</td></tr> })}</tbody></table>
          {!alerts.length && <p className="py-6 text-center text-xs text-muted">No active alerts.</p>}</div></Card>
      <ActivityFeed limit={6} bodyClass="max-h-[300px] xl:max-h-[calc(27dvh-38px)]" />
    </div>
    <div className="mt-3 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card title="Recent approvals" action={<span className="rounded-full bg-ok/10 px-2 py-0.5 text-[10.5px] font-medium text-ok">{recentApprovals.length} today</span>} pad={false}>
        <ul className="divide-y divide-line/60 px-3">{recentApprovals.slice(0, 4).map((v) => <li key={v.id} className="flex items-center gap-2 py-1.5"><Avatar name={v.name} src={v.photo} size={24} /><div className="min-w-0 flex-1 leading-tight"><p className="truncate text-xs font-medium">{v.name}</p><p className="text-[10.5px] text-muted">Office {L.officeNo(v.officeId)} · {fmtTime(v.approvedAt)}</p></div><Check size={13} className="shrink-0 text-ok" /></li>)}</ul></Card>
      <Card title="Building occupancy"><div className="flex items-baseline justify-between"><p className="text-xl font-semibold tabular-nums">{totalIn}<span className="ml-1 text-[11px] font-normal text-muted">of {cap.toLocaleString('en-IN')}</span></p><span className="text-xs font-medium text-brand">{Math.round((totalIn / cap) * 100)}%</span></div><ProgressBar className="mt-2" value={(totalIn / cap) * 100} />
        <dl className="mt-3 space-y-1.5 text-xs">{[['Employees', empIn], ['Visitors inside', inside.length], ['Exited today', vs.exited]].map(([l, n]) => <div key={l as string} className="flex justify-between"><dt className="text-muted">{l}</dt><dd className="font-medium tabular-nums">{n}</dd></div>)}</dl></Card>
      <Card title="Upcoming maintenance" pad={false}><ul className="divide-y divide-line/60 px-3">{upcoming.map((m) => { const d = daysUntil(m.nextDue); return <li key={m.id} className="flex items-center justify-between gap-2 py-1.5 text-xs"><span className="min-w-0 truncate">{m.title}</span><span className={`shrink-0 text-[10.5px] font-medium ${d < 0 ? 'text-bad' : d < 7 ? 'text-warn' : 'text-muted'}`}>{d < 0 ? `${-d}d overdue` : `in ${d}d`}</span></li> })}</ul></Card>
      <Card title="Staff availability"><div className="space-y-2">{[['Available', es.available, 'ok'], ['Busy', es.busy, 'info'], ['On break', es.onBreak, 'warn'], ['Off / absent', es.offDuty + es.absent, 'bad']].map(([l, n, t]) => <div key={l as string}><div className="flex justify-between text-xs"><span className="text-muted">{l}</span><span className="font-medium tabular-nums">{n}</span></div><ProgressBar value={((n as number) / es.total) * 100} tone={t as 'ok'} /></div>)}</div></Card>
    </div>
    <p className="sr-only"><StatusBadge status="OPEN" />{today.length}</p>
  </>
}
