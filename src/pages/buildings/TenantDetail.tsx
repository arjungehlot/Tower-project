import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Avatar, Card, DataTable, KV, PageHeader, StatusBadge, Tabs, Timeline } from '@/components/ui'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { currency } from '@/utils/constants'
import { fmtDate, fmtDateTime } from '@/utils/dateUtils'

export default function TenantDetail() {
  const { id } = useParams(), nav = useNavigate(), L = useLookups(), { offices, visitors, tickets, officeEmployees, documents, auditLogs } = useDb(), [tab, setTab] = useState('offices')
  const t = L.tenant(id)
  if (!t) return <p className="p-6 text-muted">Company not found.</p>
  const os = offices.filter((o) => o.tenantId === t.id), ids = new Set(os.map((o) => o.id))
  const emps = officeEmployees.filter((e) => ids.has(e.officeId)), vs = visitors.filter((v) => ids.has(v.officeId)), tk = tickets.filter((x) => ids.has(x.officeId))
  const monthly = os.reduce((a, o) => a + o.rent + o.maintenanceCharge, 0)
  const payments = os.flatMap((o) => [0, 1, 2].map((m) => ({ id: o.id + m, office: o.number, period: new Date(Date.now() - m * 30 * 86400000).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), amount: o.rent + o.maintenanceCharge, status: m === 0 && o.number.endsWith('3') ? 'PENDING' : 'DELIVERED' })))
  return <>
    <PageHeader back={<Link to="/tenants" className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Tenants</Link>} title={<span className="flex items-center gap-2"><Avatar name={t.name} size={30} />{t.name} <StatusBadge status={t.leaseStatus} /></span>} subtitle={`${t.industry} · GST ${t.gst}`} />
    <div className="mb-3 grid gap-3 lg:grid-cols-3"><Card title="Contact"><KV k="Person" v={t.contactPerson} /><KV k="Phone" v={t.phone} /><KV k="Email" v={t.email} /></Card><Card title="Summary"><KV k="Offices" v={os.length} /><KV k="Employees" v={emps.length} /><KV k="Monthly billing" v={currency(monthly)} /></Card><Card title="Documents">{documents.filter((d) => d.entityId === t.id).map((d) => <p key={d.id} className="py-0.5 text-xs">{d.title}</p>)}{!documents.some((d) => d.entityId === t.id) && <p className="text-xs text-muted">None attached</p>}</Card></div>
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'offices', label: 'Offices', count: os.length }, { id: 'employees', label: 'Employees', count: emps.length }, { id: 'visitors', label: 'Visitors', count: vs.length }, { id: 'tickets', label: 'Tickets', count: tk.length }, { id: 'lease', label: 'Lease' }, { id: 'payments', label: 'Payments' }, { id: 'activity', label: 'Activity' }]} />
    <div className="mt-4">
      {tab === 'offices' && <DataTable rows={os} rowKey={(o) => o.id} onRowClick={(o) => nav(`/offices/${o.id}`)} columns={[{ key: 'n', header: 'Office', render: (o) => <b>{o.number}</b> }, { key: 'l', header: 'Location', render: (o) => L.location(o.towerId, o.floorId) }, { key: 'a', header: 'Area', render: (o) => `${o.area} sqft` }, { key: 's', header: 'Status', render: (o) => <StatusBadge status={o.status} /> }]} empty={{ title: 'No offices leased' }} />}
      {tab === 'employees' && <DataTable rows={emps} rowKey={(e) => e.id} searchText={(e) => e.name} columns={[{ key: 'n', header: 'Name', render: (e) => e.name }, { key: 'o', header: 'Office', render: (e) => L.officeNo(e.officeId) }, { key: 'd', header: 'Designation', render: (e) => e.designation }, { key: 'p', header: 'Phone', render: (e) => e.phone }]} />}
      {tab === 'visitors' && <DataTable rows={vs} rowKey={(v) => v.id} onRowClick={(v) => nav(`/visitors/${v.id}`)} columns={[{ key: 'n', header: 'Visitor', render: (v) => v.name }, { key: 'o', header: 'Office', render: (v) => L.officeNo(v.officeId) }, { key: 't', header: 'Time', render: (v) => fmtDateTime(v.requestedAt) }, { key: 's', header: 'Status', render: (v) => <StatusBadge status={v.status} /> }]} empty={{ title: 'No visitors' }} />}
      {tab === 'tickets' && <DataTable rows={tk} rowKey={(x) => x.id} onRowClick={(x) => nav(`/tickets/${x.id}`)} columns={[{ key: 'c', header: 'Ticket', render: (x) => <b>{x.code}</b> }, { key: 's', header: 'Subject', render: (x) => x.subject }, { key: 'st', header: 'Status', render: (x) => <StatusBadge status={x.status} /> }]} empty={{ title: 'No tickets' }} />}
      {tab === 'lease' && <DataTable rows={os} rowKey={(o) => o.id} columns={[{ key: 'n', header: 'Office', render: (o) => o.number }, { key: 's', header: 'Start', render: (o) => fmtDate(o.leaseStart) }, { key: 'e', header: 'End', render: (o) => fmtDate(o.leaseEnd) }, { key: 'r', header: 'Rent', render: (o) => currency(o.rent) }, { key: 'd', header: 'Deposit', render: (o) => currency(o.deposit) }]} />}
      {tab === 'payments' && <DataTable rows={payments} rowKey={(p) => p.id} columns={[{ key: 'o', header: 'Office', render: (p) => p.office }, { key: 'p', header: 'Period', render: (p) => p.period }, { key: 'a', header: 'Amount', render: (p) => currency(p.amount) }, { key: 's', header: 'Status', render: (p) => <StatusBadge status={p.status === 'DELIVERED' ? 'APPROVED' : 'PENDING'} label={p.status === 'DELIVERED' ? 'Paid' : 'Due'} /> }]} />}
      {tab === 'activity' && <Card><Timeline items={auditLogs.filter((a) => a.entity.includes(t.name)).map((a) => ({ at: a.timestamp, label: `${a.user} ${a.action}` })).concat(vs.slice(0, 3).map((v) => ({ at: v.requestedAt, label: `Visitor ${v.name} registered` }))).sort((a, b) => a.at.localeCompare(b.at))} /></Card>}
    </div>
  </>
}
