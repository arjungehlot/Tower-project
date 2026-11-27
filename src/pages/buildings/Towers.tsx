import { Muted } from '@/components/ui'
import { CrudPage } from '@/components/business/CrudPage'
import type { Tower } from '@/types'
import { useDb } from '@/store/db'
import { uid } from '@/utils/helpers'

export default function Towers() {
  const offices = useDb((s) => s.offices)
  return <CrudPage<Tower> title="Towers" subtitle="Manage towers in your building complex" coll="towers" entity="Tower" label={(t) => t.name} searchText={(t) => `${t.name} ${t.code} ${t.address}`}
    columns={[
      { key: 'name', header: 'Tower', sort: (t) => t.name, render: (t) => <span className="whitespace-nowrap font-medium">{t.name}</span> },
      { key: 'code', header: 'Code', sort: (t) => t.code, render: (t) => <Muted>{t.code}</Muted> },
      { key: 'address', header: 'Address', render: (t) => <span className="block max-w-[260px] truncate text-muted">{t.address}</span>, hideMobile: true },
      { key: 'floors', header: 'Floors', sort: (t) => t.floors, render: (t) => t.floors },
      { key: 'offices', header: 'Offices', sort: (t) => offices.filter((o) => o.towerId === t.id).length, render: (t) => { const all = offices.filter((o) => o.towerId === t.id), occ = all.filter((o) => o.tenantId).length, pct = all.length ? Math.round((occ / all.length) * 100) : 0; return <span className="whitespace-nowrap">{all.length} <span className="text-muted">· {pct}% occupied</span></span> } },
      { key: 'mc', header: 'Management', render: (t) => <Muted>{t.managementContact}</Muted>, hideMobile: true },
      { key: 'sd', header: 'Security desk', render: (t) => <Muted>{t.securityDesk}</Muted>, hideMobile: true },
    ]}
    fields={[{ name: 'name', label: 'Tower name', required: true }, { name: 'code', label: 'Tower code', required: true }, { name: 'address', label: 'Address', required: true, type: 'textarea' }, { name: 'floors', label: 'Number of floors', type: 'number', min: 1 }, { name: 'managementContact', label: 'Management contact', type: 'tel', required: true }, { name: 'securityDesk', label: 'Security desk', type: 'tel' }, { name: 'emergencyContact', label: 'Emergency contact', type: 'tel', required: true }]}
    make={(v) => ({ id: uid('tw'), totalOffices: 0, ...v } as unknown as Tower)} />
}
