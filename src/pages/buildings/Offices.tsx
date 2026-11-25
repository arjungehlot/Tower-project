import { useNavigate } from 'react-router-dom'
import { CrudPage } from '@/components/business/CrudPage'
import { StatusBadge } from '@/components/ui'
import { useDb } from '@/store/db'
import { useOffices } from '@/hooks/useOffices'
import { useLookups } from '@/hooks/useLookups'
import { syncTenantOfficeCounts } from '@/services/officeService'
import { OFFICE_STATUSES, OFFICE_TYPES, currency } from '@/utils/constants'
import { fmtDate } from '@/utils/dateUtils'
import { uid } from '@/utils/helpers'
import type { Office } from '@/types'

export default function Offices() {
  const nav = useNavigate(), L = useLookups(), { offices } = useOffices(), towers = useDb((s) => s.towers), floors = useDb((s) => s.floors), tenants = useDb((s) => s.tenants)
  return <CrudPage<Office> title="Offices" subtitle="All office units across towers" coll="offices" entity="Office" rows={offices} label={(o) => `Office ${o.number}`} afterChange={syncTenantOfficeCounts}
    searchText={(o) => `${o.number} ${L.tenant(o.tenantId)?.name ?? ''} ${o.contactPerson} ${L.tower(o.towerId)?.name}`}
    filters={[{ label: 'Tower', options: towers.map((t) => t.name), pick: (o) => L.tower(o.towerId)?.name ?? '' }, { label: 'Status', options: OFFICE_STATUSES, pick: (o) => o.status }, { label: 'Type', options: OFFICE_TYPES, pick: (o) => o.type }]}
    onRowClick={(o) => nav(`/offices/${o.id}`)}
    columns={[{ key: 'n', header: 'Office', sort: (o) => o.number, render: (o) => <span className="font-semibold">{o.number}</span> },
      { key: 't', header: 'Tower / Floor', sort: (o) => o.towerId + o.floorId, render: (o) => `${L.tower(o.towerId)?.code} · F${L.floor(o.floorId)?.number}` },
      { key: 'c', header: 'Company', sort: (o) => L.tenant(o.tenantId)?.name ?? '', render: (o) => L.tenant(o.tenantId)?.name ?? <span className="text-faint">—</span> },
      { key: 'a', header: 'Area (sqft)', sort: (o) => o.area, render: (o) => o.area.toLocaleString('en-IN'), hideMobile: true },
      { key: 'r', header: 'Rent / mo', sort: (o) => o.rent, render: (o) => (o.rent ? currency(o.rent) : '—') },
      { key: 'le', header: 'Lease end', sort: (o) => o.leaseEnd, render: (o) => fmtDate(o.leaseEnd), hideMobile: true },
      { key: 's', header: 'Status', sort: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> }]}
    fields={[{ name: 'number', label: 'Office number', required: true }, { name: 'floorId', label: 'Floor', type: 'select', required: true, options: floors.map((f) => ({ value: f.id, label: `${L.tower(f.towerId)?.name} · Floor ${f.number}` })) },
      { name: 'status', label: 'Status', type: 'select', required: true, options: OFFICE_STATUSES }, { name: 'type', label: 'Type', type: 'select', options: OFFICE_TYPES }, { name: 'area', label: 'Area (sqft)', type: 'number', min: 1 },
      { name: 'tenantId', label: 'Company / Tenant', type: 'select', options: tenants.map((t) => ({ value: t.id, label: t.name })) }, { name: 'ownerName', label: 'Owner' }, { name: 'contactPerson', label: 'Contact person' }, { name: 'contactNumber', label: 'Contact number', type: 'tel' }, { name: 'email', label: 'Email', type: 'email' },
      { name: 'leaseStart', label: 'Lease start', type: 'date' }, { name: 'leaseEnd', label: 'Lease end', type: 'date' }, { name: 'rent', label: 'Monthly rent (₹)', type: 'number' }, { name: 'deposit', label: 'Security deposit (₹)', type: 'number' }, { name: 'maintenanceCharge', label: 'Maintenance charge (₹)', type: 'number' }, { name: 'notes', label: 'Notes', type: 'textarea' }]}
    transform={(v) => ({ ...v, towerId: L.floor(v.floorId as string)?.towerId ?? '' })}
    make={(v) => ({ id: uid('of'), ...v } as unknown as Office)} />
}
