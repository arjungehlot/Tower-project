import type { Ticket } from '@/types'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Avatar, Button, DataTable, PageHeader, Select, Tabs, Pill, Dash, Muted, type PillTone } from '@/components/ui'
import { TicketForm } from '@/components/business/TicketForm'
import { useTickets } from '@/hooks/useTickets'
import { useLookups } from '@/hooks/useLookups'
import { OwnerTicketActions } from '@/components/business/OwnerTicketActions'
import { useMe } from '@/hooks/useMe'
import { TICKET_CATEGORIES, PRIORITIES } from '@/utils/constants'
import { ago } from '@/utils/dateUtils'

const TT: Record<string, PillTone> = { OPEN: 'info', ASSIGNED: 'warn', PENDING_OWNER: 'warn', OWNER_REJECTED: 'bad', IN_PROGRESS: 'brand', WAITING: 'vis', RESOLVED: 'ok', CLOSED: 'muted' }
const TL: Record<string, string> = { OPEN: 'Open', ASSIGNED: 'Assigned', PENDING_OWNER: 'Awaiting owner', OWNER_REJECTED: 'Declined by owner', IN_PROGRESS: 'In progress', WAITING: 'Waiting', RESOLVED: 'Resolved', CLOSED: 'Closed' }
const PC: Record<string, string> = { CRITICAL: 'text-bad', HIGH: 'text-warn' }

export default function TicketList({ mine }: { mine?: boolean }) {
  const nav = useNavigate(), L = useLookups(), { me, officeId, ownedIds, can } = useMe(), { tickets } = useTickets(), [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false), [tab, setTab] = useState('all'), [f, setF] = useState({ cat: '', pri: '', st: '' })
  useEffect(() => { if (params.get('new')) { setOpen(true); setParams({}, { replace: true }) } }, [params]) // eslint-disable-line
  let base = tickets
  const isOwner = me?.role === 'OWNER'
  if (isOwner) base = base.filter((t) => ownedIds.includes(t.officeId))
  else if (me?.role.startsWith('OFFICE') || mine) base = base.filter((t) => t.officeId === officeId)
  if (me?.role === 'STAFF') base = base.filter((t) => t.assignedEmployeeId === me.refId)
  const G: Record<string, (s: string) => boolean> = { all: () => true, pending: (s) => s === 'PENDING_OWNER', open: (s) => s === 'OPEN', active: (s) => ['ASSIGNED', 'IN_PROGRESS', 'WAITING'].includes(s), done: (s) => ['RESOLVED', 'CLOSED'].includes(s) }
  const rows = base.filter((t) => G[tab](t.status) && (!f.cat || t.category === f.cat) && (!f.pri || t.priority === f.pri) && (!f.st || t.status === f.st)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return <>
    <PageHeader title={mine || (me?.role.startsWith('OFFICE') && !isOwner) ? 'My Tickets' : 'Tickets'} subtitle="Service desk — complaints and maintenance requests" actions={can('tickets', 'create') && <Button variant="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>Raise ticket</Button>} />
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All', count: base.length }, ...(isOwner || me?.role.startsWith('OFFICE') ? [{ id: 'pending', label: 'Awaiting owner', count: base.filter((t) => t.status === 'PENDING_OWNER').length }] : []), { id: 'open', label: 'Needs assignment', count: base.filter((t) => t.status === 'OPEN').length }, { id: 'active', label: 'In progress', count: base.filter((t) => G.active(t.status)).length }, { id: 'done', label: 'Resolved / closed', count: base.filter((t) => G.done(t.status)).length }]} />
    <div className="mt-3"><DataTable rows={rows} rowKey={(t) => t.id} onRowClick={(t) => nav(`/tickets/${t.id}`)} exportName="tickets" searchText={(t) => `${t.code} ${t.subject} Office ${L.officeNo(t.officeId)}`}
      filters={<><Select aria-label="Category" className="w-32" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} options={TICKET_CATEGORIES} placeholder="Category" /><Select aria-label="Priority" className="w-28" value={f.pri} onChange={(e) => setF({ ...f, pri: e.target.value })} options={PRIORITIES} placeholder="Priority" /><Select aria-label="Status" className="w-32" value={f.st} onChange={(e) => setF({ ...f, st: e.target.value })} options={['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']} placeholder="Status" /></>}
      columns={[
        { key: 'c', header: 'Ticket', sort: (t) => t.code, render: (t) => <span className="block max-w-[320px] truncate"><span className="text-muted">{t.code}</span> · {t.subject}</span>, csv: (t) => `${t.code} ${t.subject}` },
        { key: 'ca', header: 'Category', sort: (t) => t.category, render: (t) => <Muted>{t.category}</Muted>, csv: (t) => t.category, hideMobile: true },
        { key: 'o', header: 'Office', sort: (t) => L.officeNo(t.officeId), render: (t) => <span className="whitespace-nowrap">{L.officeNo(t.officeId)} <span className="text-muted">· {L.officeTenant(t.officeId)?.name}</span></span>, csv: (t) => L.officeNo(t.officeId), hideMobile: true },
        { key: 'p', header: 'Priority', sort: (t) => PRIORITIES.indexOf(t.priority), render: (t) => <span className={`whitespace-nowrap capitalize ${PC[t.priority] ?? 'text-muted'}`}>{t.priority.toLowerCase()}</span>, csv: (t) => t.priority },
        { key: 'a', header: 'Assigned', render: (t) => { const e = L.employee(t.assignedEmployeeId); return e ? <span className="inline-flex items-center gap-2 whitespace-nowrap"><Avatar name={e.name} size={22} />{e.name}</span> : <Dash /> }, csv: (t) => L.employee(t.assignedEmployeeId)?.name, hideMobile: true },
        { key: 'd', header: 'Raised', sort: (t) => t.createdAt, render: (t) => <Muted>{ago(t.createdAt)}</Muted>, csv: (t) => t.createdAt },
        { key: 's', header: 'Status', sort: (t) => t.status, render: (t) => <Pill tone={TT[t.status] ?? 'muted'}>{TL[t.status] ?? t.status}</Pill>, csv: (t) => t.status }, ...(isOwner ? [{ key: 'ac', header: 'Actions', render: (t: Ticket) => <div className="flex gap-1" onClick={(e) => e.stopPropagation()}><OwnerTicketActions t={t} soft /></div> }] : [])]}
      empty={{ title: 'No tickets found', text: 'Nothing matches this view.', action: can('tickets', 'create') ? 'Raise ticket' : undefined, onAction: () => setOpen(true) }} /></div>
    <TicketForm open={open} onClose={() => setOpen(false)} />
  </>
}
