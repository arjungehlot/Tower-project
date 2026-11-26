import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Avatar, Button, DataTable, PageHeader, Select, StatusBadge } from '@/components/ui'
import { VisitorActions } from '@/components/business/VisitorActions'
import { LiveDuration } from '@/components/business/VisitorCard'
import { useVisitors } from '@/hooks/useVisitors'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import { useDb } from '@/store/db'
import { PURPOSES } from '@/utils/constants'
import { fmtDateTime, fmtTime, isToday } from '@/utils/dateUtils'
import type { Visitor } from '@/types'

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
        { key: 'p', header: 'Visitor', sort: (v) => v.name, csv: (v) => v.name, render: (v: Visitor) => <div className="flex items-center gap-2"><Avatar name={v.name} src={v.photo} size={28} /><p className="font-semibold">{v.name}</p></div> },
        { key: 'm', header: 'Mobile', render: (v) => <span className="tabular-nums text-muted">{v.mobile}</span>, csv: (v) => v.mobile, hideMobile: true },
        { key: 'o', header: 'Office', sort: (v) => L.officeNo(v.officeId), render: (v) => <span className="inline-flex items-center gap-1.5"><b>{L.officeNo(v.officeId)}</b><span className="rounded bg-subtle px-1 py-px text-[9.5px] font-semibold text-muted">{L.tower(v.towerId)?.code}</span></span>, csv: (v) => L.officeNo(v.officeId) },
        { key: 'h', header: 'Host', sort: (v) => L.host(v.hostId)?.name ?? '', render: (v) => L.host(v.hostId)?.name, hideMobile: true, csv: (v) => L.host(v.hostId)?.name },
        { key: 'pu', header: 'Purpose', sort: (v) => v.purpose, render: (v) => <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[10.5px] font-medium text-brand">{v.purpose}</span>, csv: (v) => v.purpose, hideMobile: true },
        { key: 'en', header: 'Entry', sort: (v) => v.entryAt, render: (v) => v.entryAt ? <span className="tabular-nums">{fmtDateTime(v.entryAt)}</span> : <span className="text-faint">—</span>, csv: (v) => v.entryAt },
        { key: 'ex', header: 'Exit / Inside', sort: (v) => v.exitAt, render: (v) => v.status === 'INSIDE' ? <span className="font-medium text-info"><LiveDuration from={v.entryAt} /></span> : v.exitAt ? <span className="tabular-nums">{fmtTime(v.exitAt)}</span> : <span className="text-faint">—</span>, csv: (v) => v.exitAt, hideMobile: true },
        { key: 's', header: 'Status', sort: (v) => v.status, render: (v) => <StatusBadge status={v.status} />, csv: (v) => v.status },
        { key: 'a', header: 'Actions', className: 'text-right', render: (v) => <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}><VisitorActions v={v} size="xs" iconOnly /></div> },
      ]}
      empty={{ title: 'No visitors found', text: 'Adjust the filters or register a new visitor.', action: can('visitors', 'create') ? 'Register Visitor' : undefined, onAction: () => nav('/visitor/register') }} />
  </>
}
