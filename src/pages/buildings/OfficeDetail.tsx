import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
    <div className="mt-4">
      {tab === 'overview' && <div className="grid gap-3 lg:grid-cols-2"><Card title="Unit details"><KV k="Tower" v={L.tower(o.towerId)?.name} /><KV k="Floor" v={L.floor(o.floorId)?.number} /><KV k="Area" v={`${o.area} sqft`} /><KV k="Type" v={o.type} /><KV k="Owner" v={o.ownerName} /><KV k="Notes" v={o.notes} /></Card>
        <Card title="Contact & rent"><KV k="Company" v={t && <Link className="text-brand" to={`/tenants/${t.id}`}>{t.name}</Link>} /><KV k="Contact person" v={o.contactPerson} /><KV k="Phone" v={o.contactNumber} /><KV k="Email" v={o.email} /><KV k="Monthly rent" v={o.rent ? currency(o.rent) : ''} /><KV k="Maintenance" v={o.maintenanceCharge ? currency(o.maintenanceCharge) : ''} /></Card></div>}
      {tab === 'employees' && <DataTable rows={emps} rowKey={(e) => e.id} pageSize={8} columns={[{ key: 'n', header: 'Name', render: (e) => <span className="flex items-center gap-2"><Avatar name={e.name} size={24} />{e.name}</span> }, { key: 'd', header: 'Designation', render: (e) => e.designation }, { key: 'p', header: 'Phone', render: (e) => e.phone }, { key: 'e', header: 'Email', render: (e) => e.email, hideMobile: true }]} empty={{ title: 'No employees registered' }} />}
      {tab === 'visitors' && <DataTable rows={vis} rowKey={(v) => v.id} pageSize={8} onRowClick={(v) => nav(`/visitors/${v.id}`)} columns={[{ key: 'n', header: 'Visitor', render: (v) => v.name }, { key: 'p', header: 'Purpose', render: (v) => v.purpose }, { key: 't', header: 'Requested', render: (v) => fmtDateTime(v.requestedAt) }, { key: 's', header: 'Status', render: (v) => <StatusBadge status={v.status} /> }]} empty={{ title: 'No visitors yet' }} />}
      {tab === 'tickets' && <DataTable rows={tks} rowKey={(x) => x.id} pageSize={8} onRowClick={(x) => nav(`/tickets/${x.id}`)} columns={[{ key: 'c', header: 'Ticket', render: (x) => <b>{x.code}</b> }, { key: 's', header: 'Subject', render: (x) => x.subject }, { key: 'p', header: 'Priority', render: (x) => <StatusBadge status={x.priority} /> }, { key: 'st', header: 'Status', render: (x) => <StatusBadge status={x.status} /> }]} empty={{ title: 'No tickets', text: 'This office has not raised any tickets.' }} />}
      {tab === 'lease' && <div className="grid gap-3 lg:grid-cols-2"><Card title="Lease information"><KV k="Lease start" v={fmtDate(o.leaseStart)} /><KV k="Lease end" v={fmtDate(o.leaseEnd)} /><KV k="Remaining" v={left === null ? '' : left < 0 ? <Badge tone="red">Expired {-left}d ago</Badge> : <Badge tone={left < 60 ? 'orange' : 'green'}>{left} days</Badge>} /><KV k="Monthly rent" v={o.rent ? currency(o.rent) : ''} /><KV k="Security deposit" v={o.deposit ? currency(o.deposit) : ''} /></Card>
        <Card title="Documents">{documents.filter((d) => d.entityId === t?.id).map((d) => <p key={d.id} className="py-1 text-xs">{d.title} <span className="text-muted">· {d.size}</span></p>)}{!documents.some((d) => d.entityId === t?.id) && <p className="text-xs text-muted">No documents attached.</p>}</Card></div>}
      {tab === 'activity' && <Card>{act.length ? <Timeline items={act.slice(0, 12).reverse()} /> : <p className="text-xs text-muted">No activity recorded.</p>}</Card>}
    </div>
    {!t && <div className="mt-4"><Button onClick={() => nav('/offices')}>Back to offices</Button></div>}
  </>
}
