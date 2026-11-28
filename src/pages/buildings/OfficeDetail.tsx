import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Maximize2, IndianRupee, Wrench, CalendarClock, Users, Ticket, Building2, Layers, DoorOpen, UserRound, StickyNote, Phone, Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, Button, Card, KV, PageHeader, StatusBadge, Tabs, Timeline, Select, DataTable, Avatar } from '@/components/ui'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { changeOfficeStatus } from '@/services/officeService'
import { OFFICE_STATUSES, currency } from '@/utils/constants'
import { fmtDate, fmtDateTime, daysUntil } from '@/utils/dateUtils'
import { useMe } from '@/hooks/useMe'

export default function OfficeDetail() {
  const { id } = useParams(), L = useLookups(), nav = useNavigate(), { can } = useMe()
  const { visitors, tickets, officeEmployees, auditLogs, documents } = useDb(), [tab, setTab] = useState('overview')
  const o = L.office(id)
  if (!o) return <p className="p-6 text-muted">Office not found.</p>
  const t = L.tenant(o.tenantId), emps = officeEmployees.filter((h) => h.officeId === o.id)
  const vis = visitors.filter((v) => v.officeId === o.id).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)), tks = tickets.filter((x) => x.officeId === o.id)
  const left = o.leaseEnd ? daysUntil(o.leaseEnd) : null
  const act = [...vis.slice(0, 4).map((v) => ({ at: v.requestedAt, label: `Visitor ${v.name} — ${v.status.toLowerCase()}` })), ...tks.slice(0, 4).map((x) => ({ at: x.createdAt, label: `Ticket ${x.code}: ${x.subject}` })), ...auditLogs.filter((a) => a.entity === `Office ${o.number}`).map((a) => ({ at: a.timestamp, label: `${a.user} ${a.action}` }))].sort((a, b) => b.at.localeCompare(a.at))
  return <>
    <PageHeader back={<Link to="/offices" className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Offices</Link>}
      title={<span className="flex items-center gap-2">Office {o.number} <StatusBadge status={o.status} /></span>} subtitle={`${t?.name ?? 'Unassigned'} · ${L.location(o.towerId, o.floorId)}`}
      actions={can('offices', 'update') && <Select aria-label="Change status" className="w-44" value={o.status} onChange={(e) => changeOfficeStatus(o.id, e.target.value)} options={OFFICE_STATUSES} />} />
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'employees', label: 'Employees', count: emps.length }, { id: 'visitors', label: 'Visitors', count: vis.length }, { id: 'tickets', label: 'Tickets', count: tks.length }, { id: 'lease', label: 'Lease' }, { id: 'activity', label: 'Activity' }]} />
    <div className="mt-3">
      {tab === 'overview' && <div className="space-y-2.5">
        <div className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card md:grid-cols-3 md:divide-y-0 xl:grid-cols-4">
          {([[Maximize2, 'Area', `${o.area.toLocaleString('en-IN')} sqft`, 'text-info'], [CalendarClock, 'Lease ends', left === null ? '—' : left < 0 ? `Expired ${-left}d ago` : `in ${left} days`, left !== null && left < 60 ? 'text-bad' : 'text-vis'], [Users, 'Employees', String(emps.length), 'text-brand'], [Ticket, 'Tickets', String(tks.length), 'text-info']] as [typeof Users, string, string, string][]).map(([Icon, k, v, tone]) => <div key={k} className="flex items-center gap-2.5 px-3 py-2.5"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle ${tone}`}><Icon size={16} /></span><div className="min-w-0 leading-tight"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{k}</p><p className="truncate text-[13px] font-bold">{v}</p></div></div>)}
        </div>
        <div className="grid items-start gap-2.5 lg:grid-cols-2">
          <Card title="Unit details"><div className="grid grid-cols-2 gap-1.5">
            {([[Building2, 'Tower', L.tower(o.towerId)?.name], [Layers, 'Floor', L.floor(o.floorId)?.number], [Maximize2, 'Area', `${o.area} sqft`], [DoorOpen, 'Type', o.type], [UserRound, 'Owner', o.ownerName], [StickyNote, 'Notes', o.notes]] as [typeof Users, string, ReactNode][]).map(([Icon, k, v]) => <div key={k} className="flex items-center gap-2 rounded-lg bg-subtle/50 px-2.5 py-1.5"><Icon size={14} className="shrink-0 text-faint" /><div className="min-w-0 leading-tight"><p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted">{k}</p><p className="truncate text-xs font-semibold">{v || '—'}</p></div></div>)}
          </div></Card>
          <Card title="Tenant & contact" pad={false}>
            <div className="flex items-center gap-3 border-b bg-gradient-to-r from-brand-soft/70 to-transparent px-3 py-2.5">
              <Avatar name={t?.name ?? 'Vacant'} size={38} />
              <div className="min-w-0 flex-1 leading-tight">{t ? <Link className="truncate text-sm font-bold text-brand hover:underline" to={`/tenants/${t.id}`}>{t.name}</Link> : <p className="text-sm font-bold text-muted">No tenant assigned</p>}<p className="text-[11px] text-muted">Contact: {o.contactPerson || '—'}</p></div>
              {t && <StatusBadge status={left !== null && left < 60 ? 'Expiring soon' : 'Active'} />}
            </div>
            <div className="grid gap-1.5 p-2.5">
              <a href={o.contactNumber ? `tel:${o.contactNumber}` : undefined} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-1.5 text-xs transition-colors hover:bg-subtle/60"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-ok/15 text-ok"><Phone size={13} /></span><span className="font-medium tabular-nums">{o.contactNumber || '—'}</span><span className="ml-auto text-[10px] uppercase tracking-wide text-faint">Phone</span></a>
              <a href={o.email ? `mailto:${o.email}` : undefined} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-1.5 text-xs transition-colors hover:bg-subtle/60"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-info/15 text-info"><Mail size={13} /></span><span className="truncate font-medium">{o.email || '—'}</span><span className="ml-auto text-[10px] uppercase tracking-wide text-faint">Email</span></a>
            </div>
          </Card>
        </div></div>}
      {tab === 'employees' && <DataTable rows={emps} rowKey={(e) => e.id} pageSize={8} columns={[{ key: 'n', header: 'Name', render: (e) => <span className="flex items-center gap-2"><Avatar name={e.name} size={24} />{e.name}</span> }, { key: 'd', header: 'Designation', render: (e) => e.designation }, { key: 'p', header: 'Phone', render: (e) => e.phone }, { key: 'e', header: 'Email', render: (e) => e.email, hideMobile: true }]} empty={{ title: 'No employees registered' }} />}
      {tab === 'visitors' && <DataTable rows={vis} rowKey={(v) => v.id} pageSize={8} onRowClick={(v) => nav(`/visitors/${v.id}`)} columns={[{ key: 'n', header: 'Visitor', render: (v) => v.name }, { key: 'p', header: 'Purpose', render: (v) => v.purpose }, { key: 't', header: 'Requested', render: (v) => fmtDateTime(v.requestedAt) }, { key: 's', header: 'Status', render: (v) => <StatusBadge status={v.status} /> }]} empty={{ title: 'No visitors yet' }} />}
      {tab === 'tickets' && <DataTable rows={tks} rowKey={(x) => x.id} pageSize={8} onRowClick={(x) => nav(`/tickets/${x.id}`)} columns={[{ key: 'c', header: 'Ticket', render: (x) => <b>{x.code}</b> }, { key: 's', header: 'Subject', render: (x) => x.subject }, { key: 'p', header: 'Priority', render: (x) => <StatusBadge status={x.priority} /> }, { key: 'st', header: 'Status', render: (x) => <StatusBadge status={x.status} /> }]} empty={{ title: 'No tickets', text: 'This office has not raised any tickets.' }} />}
      {tab === 'lease' && <div className="grid gap-3 lg:grid-cols-2"><Card title="Lease information"><KV k="Lease start" v={fmtDate(o.leaseStart)} /><KV k="Lease end" v={fmtDate(o.leaseEnd)} /><KV k="Remaining" v={left === null ? '' : left < 0 ? <Badge tone="red">Expired {-left}d ago</Badge> : <Badge tone={left < 60 ? 'orange' : 'green'}>{left} days</Badge>} /><KV k="Security deposit" v={o.deposit ? currency(o.deposit) : ''} /></Card>
        <Card title="Documents">{documents.filter((d) => d.entityId === t?.id).map((d) => <p key={d.id} className="py-1 text-xs">{d.title} <span className="text-muted">· {d.size}</span></p>)}{!documents.some((d) => d.entityId === t?.id) && <p className="text-xs text-muted">No documents attached.</p>}</Card></div>}
      {tab === 'activity' && <Card>{act.length ? <Timeline items={act.slice(0, 12).reverse()} /> : <p className="text-xs text-muted">No activity recorded.</p>}</Card>}
    </div>
    {!t && <div className="mt-4"><Button onClick={() => nav('/offices')}>Back to offices</Button></div>}
  </>
}
