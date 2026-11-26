import { Building2, Layers, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { CrudPage } from '@/components/business/CrudPage'
import type { Tower } from '@/types'
import { useDb } from '@/store/db'
import { uid } from '@/utils/helpers'

export default function Towers() {
  const offices = useDb((s) => s.offices)
  return <CrudPage<Tower> title="Towers" subtitle="Manage towers in your building complex" coll="towers" entity="Tower" label={(t) => t.name} searchText={(t) => `${t.name} ${t.code} ${t.address}`}
    columns={[
      { key: 'name', header: 'Tower', sort: (t) => t.name, render: (t) => <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-vis text-white shadow-sm dark:text-slate-900"><Building2 size={17} /></span><div className="leading-tight"><p className="font-semibold">{t.name}</p><p className="mt-0.5 inline-block rounded bg-subtle px-1.5 py-px text-[10px] font-semibold tracking-wide text-muted">{t.code}</p></div></div> },
      { key: 'address', header: 'Address', render: (t) => <span className="inline-flex max-w-[260px] items-start gap-1.5 text-muted"><MapPin size={13} className="mt-0.5 shrink-0 text-faint" /><span className="line-clamp-2 leading-snug">{t.address}</span></span>, hideMobile: true },
      { key: 'floors', header: 'Floors', sort: (t) => t.floors, render: (t) => <span className="inline-flex items-center gap-1 rounded-md bg-info/15 px-2 py-0.5 text-xs font-semibold text-info"><Layers size={12} />{t.floors}</span> },
      { key: 'offices', header: 'Offices', sort: (t) => offices.filter((o) => o.towerId === t.id).length, render: (t) => { const all = offices.filter((o) => o.towerId === t.id), occ = all.filter((o) => o.tenantId).length, pct = all.length ? Math.round((occ / all.length) * 100) : 0; return <div className="w-32"><div className="flex items-center justify-between text-[11px]"><b>{all.length}</b><span className="text-muted">{pct}% occupied</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-gradient-to-r from-brand to-vis" style={{ width: `${pct}%` }} /></div></div> } },
      { key: 'mc', header: 'Management', render: (t) => <span className="inline-flex items-center gap-1.5 tabular-nums"><Phone size={12} className="text-ok" />{t.managementContact}</span>, hideMobile: true },
      { key: 'sd', header: 'Security desk', render: (t) => <span className="inline-flex items-center gap-1.5 tabular-nums"><ShieldCheck size={12} className="text-info" />{t.securityDesk}</span>, hideMobile: true },
    ]}
    fields={[{ name: 'name', label: 'Tower name', required: true }, { name: 'code', label: 'Tower code', required: true }, { name: 'address', label: 'Address', required: true, type: 'textarea' }, { name: 'floors', label: 'Number of floors', type: 'number', min: 1 }, { name: 'managementContact', label: 'Management contact', type: 'tel', required: true }, { name: 'securityDesk', label: 'Security desk', type: 'tel' }, { name: 'emergencyContact', label: 'Emergency contact', type: 'tel', required: true }]}
    make={(v) => ({ id: uid('tw'), totalOffices: 0, ...v } as unknown as Tower)} />
}
