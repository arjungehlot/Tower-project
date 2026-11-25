import { CrudPage } from '@/components/business/CrudPage'
import type { Tower } from '@/types'
import { useDb } from '@/store/db'
import { uid } from '@/utils/helpers'

export default function Towers() {
  const offices = useDb((s) => s.offices)
  return <CrudPage<Tower> title="Towers" subtitle="Manage towers in your building complex" coll="towers" entity="Tower" label={(t) => t.name} searchText={(t) => `${t.name} ${t.code} ${t.address}`}
    columns={[{ key: 'name', header: 'Tower', sort: (t) => t.name, render: (t) => <div><p className="font-semibold">{t.name}</p><p className="text-xxs text-muted">Code {t.code}</p></div> }, { key: 'address', header: 'Address', render: (t) => <span className="text-muted">{t.address}</span>, hideMobile: true }, { key: 'floors', header: 'Floors', sort: (t) => t.floors }, { key: 'offices', header: 'Offices', sort: (t) => offices.filter((o) => o.towerId === t.id).length, render: (t) => offices.filter((o) => o.towerId === t.id).length }, { key: 'mc', header: 'Management', render: (t) => t.managementContact, hideMobile: true }, { key: 'sd', header: 'Security desk', render: (t) => t.securityDesk, hideMobile: true }]}
    fields={[{ name: 'name', label: 'Tower name', required: true }, { name: 'code', label: 'Tower code', required: true }, { name: 'address', label: 'Address', required: true, type: 'textarea' }, { name: 'floors', label: 'Number of floors', type: 'number', min: 1 }, { name: 'managementContact', label: 'Management contact', type: 'tel', required: true }, { name: 'securityDesk', label: 'Security desk', type: 'tel' }, { name: 'emergencyContact', label: 'Emergency contact', type: 'tel', required: true }]}
    make={(v) => ({ id: uid('tw'), totalOffices: 0, ...v } as unknown as Tower)} />
}
