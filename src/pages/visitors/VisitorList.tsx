import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Avatar, Button, DataTable, PageHeader, Select, Pill, Dash, Muted, shortDT, type PillTone } from '@/components/ui'
import { VisitorActions } from '@/components/business/VisitorActions'
import { LiveDuration } from '@/components/business/VisitorCard'
import { useVisitors } from '@/hooks/useVisitors'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import { useDb } from '@/store/db'
import { PURPOSES } from '@/utils/constants'
import { fmtTime, isToday } from '@/utils/dateUtils'
import type { Visitor } from '@/types'

const VT: Record<string, PillTone> = { PENDING: 'warn', APPROVED: 'ok', REJECTED: 'bad', INSIDE: 'info', EXITED: 'muted', INFO_REQUESTED: 'vis' }
const VL: Record<string, string> = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', INSIDE: 'Inside', EXITED: 'Exited', INFO_REQUESTED: 'Info requested' }

const TITLES = { all: ['Visitor Management', 'All visitor registrations'], gate: ['Gate Entries', "Today's entries and exits at the gate"], history: ['Visitor History', 'Completed and rejected visits'] }
export default function VisitorList({ mode = 'all' }: { mode?: 'all' | 'gate' | 'history' }) {
  const nav = useNavigate(), L = useLookups(), { me, officeId, can } = useMe(), { visitors } = useVisitors(), { floors, users } = useDb()
  const [f, setF] = useState({ date: '', office: '', floor: '', status: '', host: '', guard: '', purpose: '' })
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const base = useMemo(() => {
    let r = visitors
    if (me?.role.startsWith('OFFICE')) r = r.filter((v) => v.officeId === officeId)
    if (mode === 'gate') r = r.filter((v) => isToday(v.entryAt) || isToday(v.exitAt))
    if (mode === 'history') r = r.filter((v) => ['EXITED', 'REJECTED'].includes(v.status))
    return [...r].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  }, [visitors, mode, me, officeId])
  const rows = base.filter((v) => (!f.date || v.requestedAt.slice(0, 10) === f.date) && (!f.office || v.officeId === f.office) && (!f.floor || v.floorId === f.floor) && (!f.status || v.status === f.status) && (!f.host || v.hostId === f.host) && (!f.guard || v.guardId === f.guard) && (!f.purpose || v.purpose === f.purpose))
  const [title, sub] = TITLES[mode]
  const offs = [...new Set(base.map((v) => v.officeId))].map((id) => ({ value: id, label: `Office ${L.officeNo(id)}` })).sort((a, b) => a.label.localeCompare(b.label))
  const hosts = [...new Set(base.map((v) => v.hostId))].map((id) => ({ value: id, label: L.host(id)?.name ?? id }))
  return <>
    <PageHeader title={title} subtitle={sub} actions={can('visitors', 'create') && <Button variant="primary" icon={<Plus size={14} />} onClick={() => nav('/visitor/register')}>{me?.role.startsWith('OFFICE') ? 'Invite visitor' : 'Register visitor'}</Button>} />
    <DataTable rows={rows} rowKey={(v) => v.id} onRowClick={(v) => nav(`/visitors/${v.id}`)} exportName={`visitors-${mode}`} selectable
      searchText={(v) => `${v.name} ${v.mobile} Office ${L.officeNo(v.officeId)} ${L.host(v.hostId)?.name}`}
      bulk={(ids, clear) => <Button size="sm" onClick={() => { useDb.getState().toast(`${ids.length} visitor(s) exported`, 'info'); clear() }}>Export {ids.length}</Button>}
      filters={<>
        <input type="date" aria-label="Date" className="input !w-32" value={f.date} onChange={(e) => set('date', e.target.value)} />
        <Select aria-label="Office" className="!w-28" value={f.office} onChange={(e) => set('office', e.target.value)} options={offs} placeholder="Office" />
        <Select aria-label="Floor" className="!w-24" value={f.floor} onChange={(e) => set('floor', e.target.value)} options={floors.map((x) => ({ value: x.id, label: `${L.tower(x.towerId)?.code} · F${x.number}` }))} placeholder="Floor" />
        <Select aria-label="Status" className="!w-24" value={f.status} onChange={(e) => set('status', e.target.value)} options={['PENDING', 'APPROVED', 'REJECTED', 'INSIDE', 'EXITED']} placeholder="Status" />
        <Select aria-label="Host" className="!w-28" value={f.host} onChange={(e) => set('host', e.target.value)} options={hosts} placeholder="Host" />
        <Select aria-label="Guard" className="!w-24" value={f.guard} onChange={(e) => set('guard', e.target.value)} options={users.filter((u) => u.role === 'SECURITY_GUARD').map((u) => ({ value: u.id, label: u.name }))} placeholder="Guard" />
        <Select aria-label="Purpose" className="!w-24" value={f.purpose} onChange={(e) => set('purpose', e.target.value)} options={PURPOSES} placeholder="Purpose" /></>}
      columns={[
        { key: 'p', header: 'Visitor', sort: (v) => v.name, csv: (v) => v.name, render: (v: Visitor) => <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium"><Avatar name={v.name} src={v.photo} size={24} />{v.name}</span> },
        { key: 'm', header: 'Mobile', render: (v) => <Muted>{v.mobile}</Muted>, csv: (v) => v.mobile, hideMobile: true },
        { key: 'o', header: 'Office', sort: (v) => L.officeNo(v.officeId), render: (v) => <span className="whitespace-nowrap">{L.officeNo(v.officeId)}</span>, csv: (v) => L.officeNo(v.officeId) },
        { key: 't', header: 'Tower', sort: (v) => L.tower(v.towerId)?.name ?? '', render: (v) => <Muted>{L.tower(v.towerId)?.name}</Muted>, csv: (v) => L.tower(v.towerId)?.name, hideMobile: true },
        { key: 'h', header: 'Host', sort: (v) => L.host(v.hostId)?.name ?? '', render: (v) => <span className="whitespace-nowrap">{L.host(v.hostId)?.name}</span>, hideMobile: true, csv: (v) => L.host(v.hostId)?.name },
        { key: 'pu', header: 'Purpose', sort: (v) => v.purpose, render: (v) => <Muted>{v.purpose}</Muted>, csv: (v) => v.purpose, hideMobile: true },
        { key: 'en', header: 'Entry', sort: (v) => v.entryAt, render: (v) => shortDT(v.entryAt), csv: (v) => v.entryAt },
        { key: 'ex', header: 'Exit / Inside', sort: (v) => v.exitAt, render: (v) => v.status === 'INSIDE' ? <span className="whitespace-nowrap text-info"><LiveDuration from={v.entryAt} /></span> : v.exitAt ? <span className="whitespace-nowrap">{fmtTime(v.exitAt)}</span> : <Dash />, csv: (v) => v.exitAt, hideMobile: true },
        { key: 's', header: 'Status', sort: (v) => v.status, render: (v) => <Pill tone={VT[v.status] ?? 'muted'}>{VL[v.status] ?? v.status}</Pill>, csv: (v) => v.status },
        { key: 'a', header: 'Actions', className: 'text-right', render: (v) => <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}><VisitorActions v={v} size="xs" iconOnly /></div> },
      ]}
      empty={{ title: 'No visitors found', text: 'Adjust the filters or register a new visitor.', action: can('visitors', 'create') ? 'Register Visitor' : undefined, onAction: () => nav('/visitor/register') }} />
  </>
}
