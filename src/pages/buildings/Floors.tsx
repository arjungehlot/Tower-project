import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, DoorOpen, UserRoundCheck, Ticket, Building2, Layers, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, StatCard, Card, DataTable, Select, Button, Modal, Field, Input, Dropdown, ConfirmDialog } from '@/components/ui'
import { FloorMap, MapLegend } from '@/components/business/FloorMap'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useState } from 'react'
import { uid } from '@/utils/helpers'
import { auditLog } from '@/services/core'
import type { Floor } from '@/types'

export function Floors() {
  const nav = useNavigate(), { floors, offices, visitors, tickets } = useDb(), L = useLookups(), [tw, setTw] = useState('')
  const rows = floors.filter((f) => !tw || f.towerId === tw).map((f) => { const o = offices.filter((x) => x.floorId === f.id); return { ...f, total: o.length, occ: o.filter((x) => x.status === 'Occupied').length, vac: o.filter((x) => x.status === 'Vacant').length, inside: visitors.filter((v) => v.floorId === f.id && v.status === 'INSIDE').length, tk: tickets.filter((t) => t.floorId === f.id && !['RESOLVED', 'CLOSED'].includes(t.status)).length } })
  const [edit, setEdit] = useState<Floor | null>(null), [del, setDel] = useState<Floor | null>(null), [add, setAdd] = useState(false), [nf, setNf] = useState({ towerId: '', number: '', name: '', offices: '6' }), [err, setErr] = useState('')
  const towers = useDb.getState().towers
  const openEdit = (f: Floor) => { setEdit(f); setNf({ towerId: f.towerId, number: String(f.number), name: f.name, offices: '0' }); setErr(''); setAdd(true) }
  const removeFloor = (f: Floor) => { const st = useDb.getState(), os = st.offices.filter((o) => o.floorId === f.id), tower = st.towers.find((t) => t.id === f.towerId); os.forEach((o) => st.remove('offices', o.id)); st.remove('floors', f.id); if (tower) st.patch('towers', tower.id, { floors: Math.max(0, tower.floors - 1), totalOffices: Math.max(0, tower.totalOffices - os.length) }); auditLog(`deleted floor ${f.number} from ${tower?.name}`, 'Floors', `Floor ${f.number}`); st.toast(`Floor ${f.number} deleted.`, 'info') }
  const openAdd = () => { setEdit(null); const t = tw || towers[0]?.id || '', max = Math.max(0, ...floors.filter((f) => f.towerId === t).map((f) => f.number)); setNf({ towerId: t, number: String(max + 1), name: '', offices: '6' }); setErr(''); setAdd(true) }
  const pick = (t: string) => { const max = Math.max(0, ...floors.filter((f) => f.towerId === t).map((f) => f.number)); setNf({ ...nf, towerId: t, number: String(max + 1) }) }
  const save = () => {
    if (edit) {
      const n = Number(nf.number)
      if (!Number.isInteger(n) || n < 0) return setErr('Enter a valid floor number.')
      if (floors.some((f) => f.id !== edit.id && f.towerId === edit.towerId && f.number === n)) return setErr(`Floor ${n} already exists in this tower.`)
      useDb.getState().patch('floors', edit.id, { number: n, name: nf.name.trim() || `Floor ${n}` }); auditLog(`updated floor ${n}`, 'Floors', `Floor ${n}`)
      useDb.getState().toast(`Floor ${n} updated.`); setAdd(false); setEdit(null); return
    }
    const n = Number(nf.number), c = Math.max(0, Math.min(20, Number(nf.offices) || 0))
    if (!nf.towerId) return setErr('Select a tower.')
    if (!Number.isInteger(n) || n < 0) return setErr('Enter a valid floor number.')
    if (floors.some((f) => f.towerId === nf.towerId && f.number === n)) return setErr(`Floor ${n} already exists in this tower.`)
    const st = useDb.getState(), id = uid('fl'), tower = st.towers.find((t) => t.id === nf.towerId)
    st.add('floors', { id, towerId: nf.towerId, number: n, name: nf.name.trim() || `Floor ${n}` })
    for (let i = 1; i <= c; i++) st.add('offices', { id: uid('of'), number: String(n * 100 + i), towerId: nf.towerId, floorId: id, area: 1000, type: 'Open Plan', status: 'Vacant', tenantId: '', ownerName: '', contactPerson: '', contactNumber: '', email: '', leaseStart: '', leaseEnd: '', rent: 0, deposit: 0, maintenanceCharge: 0, notes: '' })
    if (tower) st.patch('towers', tower.id, { floors: tower.floors + 1, totalOffices: tower.totalOffices + c })
    auditLog(`added floor ${n} to ${tower?.name}`, 'Floors', `Floor ${n}`)
    st.toast(`Floor ${n} added to ${tower?.name}${c ? ` with ${c} vacant offices` : ''}.`); setAdd(false)
  }
  return <><PageHeader title="Floors" subtitle="Occupancy and live status by floor" actions={<Button variant="primary" icon={<Plus size={14} />} onClick={openAdd}>Add floor</Button>} />
    <Modal open={add} onClose={() => setAdd(false)} title={edit ? "Edit floor" : "Add floor"} size="sm" footer={<><Button onClick={() => setAdd(false)}>Cancel</Button><Button variant="primary" onClick={save}>{edit ? "Save changes" : "Add floor"}</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tower" className="col-span-2"><Select disabled={!!edit} value={nf.towerId} onChange={(e) => pick(e.target.value)} options={towers.map((t) => ({ value: t.id, label: t.name }))} placeholder="Select tower" /></Field>
        <Field label="Floor number"><Input type="number" min={0} value={nf.number} onChange={(e) => setNf({ ...nf, number: e.target.value })} /></Field>
        <Field label="Floor name (optional)"><Input value={nf.name} placeholder={`Floor ${nf.number || ''}`} onChange={(e) => setNf({ ...nf, name: e.target.value })} /></Field>
        {!edit && <Field label="Vacant offices to create" className="col-span-2" hint="Numbered automatically (e.g. floor 11 → 1101, 1102…). Set 0 to add the floor only."><Input type="number" min={0} max={20} value={nf.offices} onChange={(e) => setNf({ ...nf, offices: e.target.value })} /></Field>}
      </div>
      {err && <p role="alert" className="mt-2 text-xs font-medium text-bad">{err}</p>}
    </Modal>
    <DataTable rows={rows} rowKey={(r) => r.id} onRowClick={(r) => nav(`/floors/${r.id}`)} searchText={(r) => `${r.name} ${L.tower(r.towerId)?.name}`}
      filters={<Select aria-label="Tower" className="w-36" value={tw} onChange={(e) => setTw(e.target.value)} placeholder="All towers" options={useDb.getState().towers.map((t) => ({ value: t.id, label: t.name }))} />}
      columns={[{ key: 't', header: 'Tower', sort: (r) => r.towerId, render: (r) => L.tower(r.towerId)?.name }, { key: 'f', header: 'Floor', sort: (r) => r.number, render: (r) => <span className="font-medium">Floor {r.number}</span> }, { key: 'o', header: 'Offices', sort: (r) => r.total, render: (r) => r.total }, { key: 'oc', header: 'Occupied', sort: (r) => r.occ, render: (r) => <span className="text-ok font-medium">{r.occ}</span> }, { key: 'v', header: 'Vacant', sort: (r) => r.vac, render: (r) => r.vac }, { key: 'i', header: 'Visitors inside', sort: (r) => r.inside, render: (r) => r.inside }, { key: 'tk', header: 'Open tickets', sort: (r) => r.tk, render: (r) => r.tk },
        { key: '_a', header: '', className: 'w-10 text-right', render: (r) => <div onClick={(e) => e.stopPropagation()}><Dropdown trigger={<button aria-label="Row actions" className="rounded p-1 text-muted hover:bg-subtle"><MoreHorizontal size={15} /></button>} items={[{ label: 'Edit', icon: <Pencil size={13} />, onClick: () => openEdit(r) }, { label: 'Delete', icon: <Trash2 size={13} />, danger: true, onClick: () => setDel(r) }]} /></div> }]} />
    <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete floor" message={del ? `Delete ${L.tower(del.towerId)?.name} — Floor ${del.number}? ${offices.filter((o) => o.floorId === del.id).length} office(s) on this floor will also be removed. This cannot be undone.` : ''} onConfirm={() => { if (del) removeFloor(del) }} /></>
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
