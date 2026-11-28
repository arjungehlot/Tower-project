import { Link, useNavigate } from 'react-router-dom'
import { Building2, DoorOpen, ShieldQuestion, Ticket, Users, CheckCheck } from 'lucide-react'
import { Avatar, Card, Pill, Dash, type PillTone } from '@/components/ui'
import { OwnerTicketActions } from '@/components/business/OwnerTicketActions'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { daysUntil, ago } from '@/utils/dateUtils'

const TT: Record<string, PillTone> = { OPEN: 'info', ASSIGNED: 'warn', IN_PROGRESS: 'brand', WAITING: 'vis', RESOLVED: 'ok', CLOSED: 'muted', PENDING_OWNER: 'warn', OWNER_REJECTED: 'bad' }
const TL: Record<string, string> = { OPEN: 'With admin', ASSIGNED: 'Assigned', IN_PROGRESS: 'In progress', WAITING: 'Waiting', RESOLVED: 'Resolved', CLOSED: 'Closed', PENDING_OWNER: 'Awaiting you', OWNER_REJECTED: 'Declined' }
const PC: Record<string, string> = { CRITICAL: 'text-bad', HIGH: 'text-warn' }
const th = 'px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted'

/** Office-owner portal: the owner's offices, and the tickets their offices raise that need a decision. */
export default function OwnerDashboard() {
  const nav = useNavigate(), L = useLookups(), { me, ownedIds } = useMe(), offices = useDb((s) => s.offices), tickets = useDb((s) => s.tickets), emps = useDb((s) => s.officeEmployees)
  const mine = offices.filter((o) => ownedIds.includes(o.id)).sort((a, b) => a.number.localeCompare(b.number))
  const tks = tickets.filter((t) => ownedIds.includes(t.officeId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const pending = tks.filter((t) => t.status === 'PENDING_OWNER'), active = tks.filter((t) => !['CLOSED', 'RESOLVED', 'PENDING_OWNER', 'OWNER_REJECTED'].includes(t.status))
  const occ = mine.filter((o) => o.tenantId).length, people = emps.filter((e) => ownedIds.includes(e.officeId)).length
  const K: [string, number, React.ReactNode, string, string][] = [
    ['My offices', mine.length, <DoorOpen size={16} />, 'text-brand bg-brand/10', `${occ} occupied · ${mine.length - occ} vacant`],
    ['Awaiting approval', pending.length, <ShieldQuestion size={16} />, 'text-warn bg-warn/10', pending.length ? 'Needs your decision' : 'All clear'],
    ['Active tickets', active.length, <Ticket size={16} />, 'text-info bg-info/10', 'With admin / staff'],
    ['People in my offices', people, <Users size={16} />, 'text-ok bg-ok/10', 'Registered employees'],
  ]
  return <>
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Building2 size={19} /></span>
      <div><h1 className="text-[17px] font-bold leading-tight tracking-tight">Welcome, {me?.name.split(' ')[0]}</h1><p className="text-[11.5px] text-muted">Owner portal · {me?.refId}</p></div>
    </div>
    <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">{K.map(([l, v, ic, tc, sub]) => <div key={l} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-card">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tc}`}>{ic}</span><div className="min-w-0"><p className="truncate text-[11px] text-muted">{l}</p><p className="text-xl font-semibold leading-tight tabular-nums">{v}</p><p className="truncate text-[11px] text-muted">{sub}</p></div></div>)}</div>

    <Card title="Awaiting your approval" action={<span className="rounded-full bg-warn/10 px-2 py-0.5 text-[10.5px] font-medium text-warn">{pending.length} pending</span>} pad={false}>
      {pending.length ? <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-line"><th className={th}>Ticket</th><th className={th}>Issue</th><th className={th}>Office</th><th className={th}>Raised by</th><th className={th}>Priority</th><th className={th}>Raised</th><th className={`${th} text-right`}>Decision</th></tr></thead>
        <tbody className="divide-y divide-line/60">{pending.map((t) => { const r = L.host(t.reporterId); return <tr key={t.id} onClick={() => nav(`/tickets/${t.id}`)} className="cursor-pointer transition-colors hover:bg-subtle/60">
          <td className="whitespace-nowrap px-3 py-2 text-muted">{t.code}</td><td className="max-w-[260px] truncate px-3 py-2">{t.subject}</td><td className="whitespace-nowrap px-3 py-2">{L.officeNo(t.officeId)}</td>
          <td className="px-3 py-2">{r ? <span className="flex items-center gap-2 whitespace-nowrap"><Avatar name={r.name} size={22} />{r.name}</span> : <Dash />}</td>
          <td className={`whitespace-nowrap px-3 py-2 capitalize ${PC[t.priority] ?? 'text-muted'}`}>{t.priority.toLowerCase()}</td><td className="whitespace-nowrap px-3 py-2 text-muted">{ago(t.createdAt)}</td>
          <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}><span className="inline-flex gap-1"><OwnerTicketActions t={t} soft /></span></td></tr> })}</tbody></table></div>
        : <p className="flex items-center justify-center gap-2 py-8 text-xs text-muted"><CheckCheck size={15} className="text-ok" />Nothing waiting — every ticket from your offices has been handled.</p>}
    </Card>

    <div className="mt-3 grid items-start gap-3 xl:grid-cols-5">
      <Card title="My offices" className="xl:col-span-3" pad={false}><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-line"><th className={th}>Office</th><th className={th}>Location</th><th className={th}>Occupant</th><th className={th}>Lease ends</th><th className={th}>Tickets</th></tr></thead>
        <tbody className="divide-y divide-line/60">{mine.map((o) => { const left = o.tenantId ? daysUntil(o.leaseEnd) : null; return <tr key={o.id} onClick={() => nav(`/offices/${o.id}`)} className="cursor-pointer transition-colors hover:bg-subtle/60">
          <td className="whitespace-nowrap px-3 py-1.5 font-medium">{o.number}</td><td className="whitespace-nowrap px-3 py-1.5 text-muted">{L.tower(o.towerId)?.name} · F{L.floor(o.floorId)?.number}</td>
          <td className="max-w-[200px] truncate px-3 py-1.5">{o.tenantId ? L.tenant(o.tenantId)?.name : <span className="text-muted">Vacant</span>}</td>
          <td className={`whitespace-nowrap px-3 py-1.5 ${left !== null && left < 60 ? 'text-warn' : 'text-muted'}`}>{left === null ? '—' : left < 0 ? 'Expired' : `in ${left}d`}</td>
          <td className="px-3 py-1.5 tabular-nums">{tks.filter((t) => t.officeId === o.id && !['CLOSED', 'OWNER_REJECTED'].includes(t.status)).length}</td></tr> })}</tbody></table></div></Card>
      <Card title="Recent tickets" className="xl:col-span-2" action={<Link to="/tickets/mine" className="text-xxs font-medium text-brand">View all</Link>} pad={false}><ul className="divide-y divide-line/60">{tks.slice(0, 7).map((t) => <li key={t.id}><Link to={`/tickets/${t.id}`} className="flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-subtle/60"><span className="min-w-0 flex-1"><span className="block truncate">{t.subject}</span><span className="text-[10.5px] text-muted">{t.code} · Office {L.officeNo(t.officeId)} · {ago(t.createdAt)}</span></span><Pill tone={TT[t.status] ?? 'muted'}>{TL[t.status] ?? t.status}</Pill></Link></li>)}{!tks.length && <li className="py-6 text-center text-xs text-muted">No tickets yet.</li>}</ul></Card>
    </div>
  </>
}
