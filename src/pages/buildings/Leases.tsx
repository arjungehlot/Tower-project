import { useNavigate } from 'react-router-dom'
import { Badge, PageHeader, DataTable, Select, StatCard } from '@/components/ui'
import { FileText, AlertTriangle, CalendarClock, IndianRupee } from 'lucide-react'
import { useState } from 'react'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { currency } from '@/utils/constants'
import { daysUntil, fmtDate } from '@/utils/dateUtils'

export default function Leases() {
  const L = useLookups(), nav = useNavigate(), offices = useDb((s) => s.offices).filter((o) => o.tenantId && o.leaseEnd), [f, setF] = useState('')
  const rows = offices.map((o) => ({ ...o, left: daysUntil(o.leaseEnd) })).filter((o) => !f || (f === 'Expired' ? o.left < 0 : f === 'Expiring soon' ? o.left >= 0 && o.left < 90 : o.left >= 90))
  return <><PageHeader title="Lease Management" subtitle="Track lease terms, rent and renewals" />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Active leases" value={offices.filter((o) => daysUntil(o.leaseEnd) >= 0).length} icon={<FileText size={15} />} tone="ok" /><StatCard label="Expiring in 90 days" value={offices.filter((o) => { const d = daysUntil(o.leaseEnd); return d >= 0 && d < 90 }).length} icon={<CalendarClock size={15} />} tone="warn" />
      <StatCard label="Expired" value={offices.filter((o) => daysUntil(o.leaseEnd) < 0).length} icon={<AlertTriangle size={15} />} tone="bad" /><StatCard label="Monthly rent roll" value={currency(offices.reduce((a, o) => a + o.rent, 0))} icon={<IndianRupee size={15} />} />
    </div>
    <DataTable rows={rows} rowKey={(o) => o.id} onRowClick={(o) => nav(`/offices/${o.id}`)} searchText={(o) => `${o.number} ${L.tenant(o.tenantId)?.name}`} exportName="leases" defaultSort={{ key: 'e', dir: 'asc' }}
      filters={<Select aria-label="Lease state" className="w-40" value={f} onChange={(e) => setF(e.target.value)} placeholder="All leases" options={['Expired', 'Expiring soon', 'Active']} />}
      columns={[{ key: 'o', header: 'Office', sort: (o) => o.number, render: (o) => <b>{o.number}</b>, csv: (o) => o.number }, { key: 'c', header: 'Company', sort: (o) => L.tenant(o.tenantId)?.name ?? '', render: (o) => L.tenant(o.tenantId)?.name, csv: (o) => L.tenant(o.tenantId)?.name }, { key: 's', header: 'Start', sort: (o) => o.leaseStart, render: (o) => fmtDate(o.leaseStart) }, { key: 'e', header: 'End', sort: (o) => o.leaseEnd, render: (o) => fmtDate(o.leaseEnd) },
        { key: 'r', header: 'Rent', sort: (o) => o.rent, render: (o) => currency(o.rent), csv: (o) => o.rent }, { key: 'd', header: 'Deposit', sort: (o) => o.deposit, render: (o) => currency(o.deposit), hideMobile: true }, { key: 'l', header: 'Status', sort: (o) => o.left, render: (o) => o.left < 0 ? <Badge tone="red" dot>Expired</Badge> : o.left < 90 ? <Badge tone="orange" dot>{o.left}d left</Badge> : <Badge tone="green" dot>Active</Badge> }]} /></>
}
