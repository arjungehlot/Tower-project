import { useNavigate } from 'react-router-dom'
import { CrudPage } from '@/components/business/CrudPage'
import { Avatar, StatusBadge } from '@/components/ui'
import { useDb } from '@/store/db'
import { uid } from '@/utils/helpers'
import type { Tenant } from '@/types'

export default function Tenants() {
  const nav = useNavigate(), offices = useDb((s) => s.offices)
  const industries = [...new Set(useDb.getState().tenants.map((t) => t.industry))].sort()
  return <CrudPage<Tenant> title="Tenants / Companies" subtitle="Companies operating in the building" coll="tenants" entity="Tenant" label={(t) => t.name} searchText={(t) => `${t.name} ${t.contactPerson} ${t.industry} ${t.gst}`}
    filters={[{ label: 'Industry', options: industries, pick: (t) => t.industry }, { label: 'Lease', options: ['Active', 'Inactive'], pick: (t) => t.leaseStatus }]} onRowClick={(t) => nav(`/tenants/${t.id}`)}
    columns={[{ key: 'n', header: 'Company', sort: (t) => t.name, render: (t) => <div className="flex items-center gap-2"><Avatar name={t.name} size={26} /><div><p className="font-semibold">{t.name}</p><p className="text-xxs text-muted">{t.industry}</p></div></div> },
      { key: 'c', header: 'Contact', sort: (t) => t.contactPerson, render: (t) => <div><p>{t.contactPerson}</p><p className="text-xxs text-muted">{t.phone}</p></div> }, { key: 'g', header: 'GST', render: (t) => t.gst, hideMobile: true },
      { key: 'o', header: 'Offices', sort: (t) => offices.filter((o) => o.tenantId === t.id).length, render: (t) => offices.filter((o) => o.tenantId === t.id).length }, { key: 'l', header: 'Lease', render: (t) => <StatusBadge status={t.leaseStatus} /> }]}
    fields={[{ name: 'name', label: 'Company name', required: true }, { name: 'industry', label: 'Industry', required: true }, { name: 'contactPerson', label: 'Contact person', required: true }, { name: 'phone', label: 'Phone', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'gst', label: 'GST number' }, { name: 'leaseStatus', label: 'Lease status', type: 'select', options: ['Active', 'Inactive'], required: true }]}
    make={(v) => ({ id: uid('tn'), officeCount: 0, color: '#4f46e5', ...v } as unknown as Tenant)} />
}
