import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, DoorOpen, UserRoundCheck, Ticket, Building2, Layers } from 'lucide-react'
import { PageHeader, StatCard, Card, DataTable, Select } from '@/components/ui'
import { FloorMap, MapLegend } from '@/components/business/FloorMap'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useState } from 'react'

export function Floors() {
  const nav = useNavigate(), { floors, offices, visitors, tickets } = useDb(), L = useLookups(), [tw, setTw] = useState('')
  const rows = floors.filter((f) => !tw || f.towerId === tw).map((f) => { const o = offices.filter((x) => x.floorId === f.id); return { ...f, total: o.length, occ: o.filter((x) => x.status === 'Occupied').length, vac: o.filter((x) => x.status === 'Vacant').length, inside: visitors.filter((v) => v.floorId === f.id && v.status === 'INSIDE').length, tk: tickets.filter((t) => t.floorId === f.id && !['RESOLVED', 'CLOSED'].includes(t.status)).length } })
  return <><PageHeader title="Floors" subtitle="Occupancy and live status by floor" />
    <DataTable rows={rows} rowKey={(r) => r.id} onRowClick={(r) => nav(`/floors/${r.id}`)} searchText={(r) => `${r.name} ${L.tower(r.towerId)?.name}`} pageSize={12}
      filters={<Select aria-label="Tower" className="w-36" value={tw} onChange={(e) => setTw(e.target.value)} placeholder="All towers" options={useDb.getState().towers.map((t) => ({ value: t.id, label: t.name }))} />}
      columns={[{ key: 't', header: 'Tower', sort: (r) => r.towerId, render: (r) => L.tower(r.towerId)?.name }, { key: 'f', header: 'Floor', sort: (r) => r.number, render: (r) => <span className="font-semibold">Floor {r.number}</span> }, { key: 'o', header: 'Offices', sort: (r) => r.total, render: (r) => r.total }, { key: 'oc', header: 'Occupied', sort: (r) => r.occ, render: (r) => <span className="text-ok font-medium">{r.occ}</span> }, { key: 'v', header: 'Vacant', sort: (r) => r.vac, render: (r) => r.vac }, { key: 'i', header: 'Visitors inside', sort: (r) => r.inside, render: (r) => r.inside }, { key: 'tk', header: 'Open tickets', sort: (r) => r.tk, render: (r) => r.tk }]} /></>
}
export function FloorDetail() {
  const { id } = useParams(), L = useLookups(), { offices, visitors, tickets } = useDb(), f = L.floor(id)
  if (!f) return <p className="p-6 text-muted">Floor not found.</p>
  const o = offices.filter((x) => x.floorId === f.id).sort((a, b) => a.number.localeCompare(b.number))
  return <>
    <PageHeader back={<Link to="/floors" className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Floors</Link>} title={`${L.tower(f.towerId)?.name} — Floor ${f.number}`} subtitle="Click an office to open its profile" />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatCard label="Floor" value={f.number} icon={<Layers size={15} />} /><StatCard label="Total offices" value={o.length} icon={<DoorOpen size={15} />} />
      <StatCard label="Occupied" value={o.filter((x) => x.status === 'Occupied').length} sub={`${o.filter((x) => x.status === 'Vacant').length} vacant`} icon={<Building2 size={15} />} tone="ok" />
      <StatCard label="Visitors inside" value={visitors.filter((v) => v.floorId === f.id && v.status === 'INSIDE').length} icon={<UserRoundCheck size={15} />} tone="info" />
      <StatCard label="Open tickets" value={tickets.filter((t) => t.floorId === f.id && !['RESOLVED', 'CLOSED'].includes(t.status)).length} icon={<Ticket size={15} />} tone="warn" />
    </div>
    <Card title="Office grid" action={<MapLegend />}><FloorMap offices={o} /></Card></>
}
