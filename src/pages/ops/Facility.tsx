import { CrudPage } from '@/components/business/CrudPage'
import { Badge, StatusBadge } from '@/components/ui'
import { useDb } from '@/store/db'
import { ASSET_CATEGORIES } from '@/utils/constants'
import { daysUntil, fmtDate } from '@/utils/dateUtils'
import { uid } from '@/utils/helpers'
import type { Asset, DocumentRec, Maintenance } from '@/types'

export function Assets() {
  return <CrudPage<Asset> title="Asset Management" subtitle="Building equipment, warranties and service dates" coll="assets" entity="Asset" label={(a) => a.name} searchText={(a) => `${a.name} ${a.assetCode} ${a.location}`}
    filters={[{ label: 'Category', options: ASSET_CATEGORIES, pick: (a) => a.category }, { label: 'Status', options: ['Operational', 'Needs Service', 'Under Repair'], pick: (a) => a.status }]}
    columns={[{ key: 'c', header: 'Asset', sort: (a) => a.name, render: (a) => <div><p className="font-semibold">{a.name}</p><p className="text-xxs text-muted">{a.assetCode} · {a.category}</p></div>, csv: (a) => a.name }, { key: 'l', header: 'Location', render: (a) => a.location, csv: (a) => a.location }, { key: 'w', header: 'Warranty', sort: (a) => a.warrantyEnd, render: (a) => daysUntil(a.warrantyEnd) < 0 ? <Badge tone="red">Expired</Badge> : fmtDate(a.warrantyEnd), hideMobile: true }, { key: 'ls', header: 'Last service', render: (a) => fmtDate(a.lastService), hideMobile: true }, { key: 'n', header: 'Next service', sort: (a) => a.nextService, render: (a) => { const d = daysUntil(a.nextService); return <span className={d < 0 ? 'font-semibold text-bad' : ''}>{fmtDate(a.nextService)}</span> } }, { key: 's', header: 'Status', sort: (a) => a.status, render: (a) => <StatusBadge status={a.status} />, csv: (a) => a.status }]}
    fields={[{ name: 'name', label: 'Name', required: true }, { name: 'assetCode', label: 'Asset ID', required: true }, { name: 'category', label: 'Category', type: 'select', options: ASSET_CATEGORIES, required: true }, { name: 'location', label: 'Location', required: true }, { name: 'purchaseDate', label: 'Purchase date', type: 'date' }, { name: 'warrantyEnd', label: 'Warranty end', type: 'date' }, { name: 'lastService', label: 'Last service', type: 'date' }, { name: 'nextService', label: 'Next service', type: 'date', required: true }, { name: 'status', label: 'Status', type: 'select', options: ['Operational', 'Needs Service', 'Under Repair'], required: true }]}
    make={(v) => ({ id: uid('as'), ...v } as unknown as Asset)} />
}
export function MaintenanceSchedule() {
  const assets = useDb((s) => s.assets)
  return <CrudPage<Maintenance> title="Maintenance Schedule" subtitle="Recurring maintenance and upcoming due dates" coll="maintenance" entity="Schedule" label={(m) => m.title} searchText={(m) => m.title}
    columns={[{ key: 't', header: 'Maintenance', sort: (m) => m.title, render: (m) => <b>{m.title}</b>, csv: (m) => m.title }, { key: 'f', header: 'Frequency', render: (m) => m.frequency, csv: (m) => m.frequency }, { key: 'a', header: 'Asset', render: (m) => assets.find((a) => a.id === m.assetId)?.name ?? '—', hideMobile: true }, { key: 'd', header: 'Next due', sort: (m) => m.nextDue, render: (m) => fmtDate(m.nextDue), csv: (m) => m.nextDue }, { key: 's', header: 'Status', sort: (m) => m.nextDue, render: (m) => { const d = daysUntil(m.nextDue); return <StatusBadge status={d < 0 ? 'Overdue' : 'Upcoming'} label={d < 0 ? `${-d}d overdue` : `Due in ${d}d`} /> } }]}
    fields={[{ name: 'title', label: 'Title', required: true }, { name: 'frequency', label: 'Frequency', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly'], required: true }, { name: 'assetId', label: 'Asset', type: 'select', options: assets.map((a) => ({ value: a.id, label: a.name })) }, { name: 'nextDue', label: 'Next due', type: 'date', required: true }]}
    make={(v) => ({ id: uid('mt'), status: 'Upcoming', ...v } as unknown as Maintenance)} />
}
export function Documents() {
  return <CrudPage<DocumentRec> title="Documents" subtitle="Lease agreements, ID proofs, invoices and completion proofs" coll="documents" entity="Document" label={(d) => d.title} searchText={(d) => `${d.title} ${d.type} ${d.entity}`}
    filters={[{ label: 'Type', options: ['Lease', 'ID Proof', 'Invoice', 'Maintenance document', 'Completion proof'], pick: (d) => d.type }, { label: 'Attached to', options: ['Office', 'Tenant', 'Staff', 'Ticket', 'Asset', 'Lease'], pick: (d) => d.entity }]}
    columns={[{ key: 't', header: 'Document', sort: (d) => d.title, render: (d) => <div><p className="font-semibold">{d.title}</p><p className="text-xxs text-muted">{d.fileName} · {d.size}</p></div>, csv: (d) => d.title }, { key: 'ty', header: 'Type', render: (d) => <Badge tone="brand">{d.type}</Badge>, csv: (d) => d.type }, { key: 'e', header: 'Attached to', render: (d) => d.entity, csv: (d) => d.entity }, { key: 'u', header: 'Uploaded', sort: (d) => d.uploadedAt, render: (d) => fmtDate(d.uploadedAt), hideMobile: true }]}
    fields={[{ name: 'title', label: 'Title', required: true }, { name: 'type', label: 'Type', type: 'select', required: true, options: ['Lease', 'ID Proof', 'Invoice', 'Maintenance document', 'Completion proof'] }, { name: 'entity', label: 'Attach to', type: 'select', required: true, options: ['Office', 'Tenant', 'Staff', 'Ticket', 'Asset', 'Lease'] }, { name: 'fileName', label: 'File name', required: true, placeholder: 'document.pdf' }]}
    make={(v) => ({ id: uid('dc'), entityId: '', uploadedBy: 'Admin', uploadedAt: new Date().toISOString(), size: '120 KB', ...v } as unknown as DocumentRec)} />
}
