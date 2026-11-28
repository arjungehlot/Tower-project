import { useNavigate } from 'react-router-dom'
import { Building2, CheckCheck, CircleDot, DoorOpen, Ticket } from 'lucide-react'
import { Avatar, Card, Pill, Dash, type PillTone } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { daysUntil, ago } from '@/utils/dateUtils'

const TT: Record<string, PillTone> = { OPEN: 'info', ASSIGNED: 'warn', IN_PROGRESS: 'brand', WAITING: 'vis', RESOLVED: 'ok', CLOSED: 'muted' }
const TL: Record<string, string> = { OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In progress', WAITING: 'Waiting', RESOLVED: 'Resolved', CLOSED: 'Closed' }
const BAR: Record<string, string> = { OPEN: 'bg-info', ASSIGNED: 'bg-warn', IN_PROGRESS: 'bg-brand', WAITING: 'bg-vis', RESOLVED: 'bg-ok', CLOSED: 'bg-faint' }
const PC: Record<string, string> = { CRITICAL: 'text-bad', HIGH: 'text-warn' }
const th = 'px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted'

/** Office-owner portal — read-only overview of the owner's offices and the tickets raised from them. */
export default function OwnerDashboard() {
  const nav = useNavigate(), L = useLookups(), { me, ownedIds } = useMe(), offices = useDb((s) => s.offices), tickets = useDb((s) => s.tickets)
  const mine = offices.filter((o) => ownedIds.includes(o.id)).sort((a, b) => a.number.localeCompare(b.number))
  const tks = tickets.filter((t) => ownedIds.includes(t.officeId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const n = (...st: string[]) => tks.filter((t) => st.includes(t.status)).length
  const K: [string, number, React.ReactNode, string, string][] = [
    ['Tickets raised', tks.length, <Ticket size={16} />, 'text-brand bg-brand/10', `across ${mine.length} offices`],
    ['In progress', n('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING'), <CircleDot size={16} />, 'text-warn bg-warn/10', 'open, assigned or being worked on'],
    ['Resolved', n('RESOLVED'), <CheckCheck size={16} />, 'text-ok bg-ok/10', 'awaiting office confirmation'],
    ['Closed', n('CLOSED'), <DoorOpen size={16} />, 'text-muted bg-subtle', 'completed and confirmed'],
  ]
  return <>
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Building2 size={19} /></span>
      <div><h1 className="text-[17px] font-bold leading-tight tracking-tight">Welcome, {me?.name.split(' ')[0]}</h1><p className="text-[11.5px] text-muted">Owner portal · {me?.refId}</p></div>
    </div>
    <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">{K.map(([l, v, ic, tc, sub]) => <div key={l} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-card">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tc}`}>{ic}</span><div className="min-w-0"><p className="truncate text-[11px] text-muted">{l}</p><p className="text-xl font-semibold leading-tight tabular-nums">{v}</p><p className="truncate text-[11px] text-muted">{sub}</p></div></div>)}</div>

    <div className="grid items-start gap-3 xl:grid-cols-3">
      <Card title="Tickets from my offices" className="xl:col-span-2" pad={false}>
        <div className="max-h-[420px] overflow-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-surface"><tr className="border-b border-line"><th className={th}>Ticket</th><th className={th}>Issue</th><th className={th}>Office</th><th className={th}>Raised by</th><th className={th}>Priority</th><th className={th}>Raised</th><th className={th}>Status</th></tr></thead>
          <tbody className="divide-y divide-line/60">{tks.map((t) => { const r = L.host(t.reporterId); return <tr key={t.id} onClick={() => nav(`/tickets/${t.id}`)} className="cursor-pointer transition-colors hover:bg-subtle/60">
            <td className="whitespace-nowrap px-3 py-2 text-muted">{t.code}</td><td className="max-w-[240px] truncate px-3 py-2">{t.subject}</td><td className="whitespace-nowrap px-3 py-2">{L.officeNo(t.officeId)}</td>
            <td className="px-3 py-2">{r ? <span className="flex items-center gap-2 whitespace-nowrap"><Avatar name={r.name} size={22} />{r.name}</span> : <Dash />}</td>
            <td className={`whitespace-nowrap px-3 py-2 capitalize ${PC[t.priority] ?? 'text-muted'}`}>{t.priority.toLowerCase()}</td><td className="whitespace-nowrap px-3 py-2 text-muted">{ago(t.createdAt)}</td>
            <td className="px-3 py-2"><Pill tone={TT[t.status] ?? 'muted'}>{TL[t.status] ?? t.status}</Pill></td></tr> })}
            {!tks.length && <tr><td colSpan={7} className="py-8 text-center text-muted">No tickets raised from your offices yet.</td></tr>}</tbody></table></div>
      </Card>

      <div className="space-y-3">
        <Card title="Status overview"><div className="space-y-2">{Object.keys(TL).map((k) => <div key={k}><div className="flex justify-between text-xs"><span className="text-muted">{TL[k]}</span><span className="font-medium tabular-nums">{n(k)}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"><div className={`h-full rounded-full ${BAR[k]}`} style={{ width: `${tks.length ? (n(k) / tks.length) * 100 : 0}%` }} /></div></div>)}</div></Card>
        <Card title="My offices" pad={false}><table className="w-full text-xs"><thead><tr className="border-b border-line"><th className={th}>Office</th><th className={th}>Occupant</th><th className={th}>Lease</th></tr></thead>
          <tbody className="divide-y divide-line/60">{mine.map((o) => { const left = o.tenantId ? daysUntil(o.leaseEnd) : null; return <tr key={o.id} onClick={() => nav(`/offices/${o.id}`)} className="cursor-pointer transition-colors hover:bg-subtle/60">
            <td className="whitespace-nowrap px-3 py-1.5 font-medium">{o.number}</td><td className="max-w-[140px] truncate px-3 py-1.5">{o.tenantId ? L.tenant(o.tenantId)?.name : <span className="text-muted">Vacant</span>}</td>
            <td className={`whitespace-nowrap px-3 py-1.5 ${left !== null && left < 60 ? 'text-warn' : 'text-muted'}`}>{left === null ? '—' : left < 0 ? 'Expired' : `in ${left}d`}</td></tr> })}</tbody></table></Card>
      </div>
    </div>
  </>
}
