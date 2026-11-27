import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CheckCheck, MessageCircle, Mail, XCircle } from 'lucide-react'
import { Pill, Muted, DataTable, PageHeader, Select, StatCard, type PillTone } from '@/components/ui'
import { useDb } from '@/store/db'
import { fmtDateTime } from '@/utils/dateUtils'
import type { MessageLog as ML } from '@/types'

export default function MessageLog({ channel }: { channel: 'whatsapp' | 'email' }) {
  const nav = useNavigate(), all = useDb((s) => s.messages).filter((m) => m.channel === channel).sort((a, b) => b.sentAt.localeCompare(a.sentAt)), [f, setF] = useState({ type: '', st: '' })
  const rows = all.filter((m) => (!f.type || m.type === f.type) && (!f.st || m.status === f.st)), wa = channel === 'whatsapp'
  const MT: Record<string, PillTone> = { SENT: 'muted', DELIVERED: 'info', READ: 'ok', FAILED: 'bad' }
  const link = (m: ML) => m.type === 'Visitor approval' ? `/visitors/${m.related}` : m.type === 'Ticket assignment' ? `/tickets/${m.related}` : m.type === 'Work assignment' ? `/tasks/${m.related}` : ''
  const Tick = ({ s }: { s: string }) => s === 'READ' ? <CheckCheck size={14} className="text-info" /> : s === 'DELIVERED' ? <CheckCheck size={14} className="text-faint" /> : s === 'FAILED' ? <XCircle size={14} className="text-bad" /> : <Check size={14} className="text-faint" />
  return <>
    <PageHeader title={wa ? 'WhatsApp Log' : 'Email Log'} subtitle="Simulated outbound communication — no real messages are sent" />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Total" value={all.length} icon={wa ? <MessageCircle size={15} /> : <Mail size={15} />} />{['SENT', 'DELIVERED', 'READ'].slice(0, 3).map((s) => <StatCard key={s} label={s} value={all.filter((m) => m.status === s).length} icon={<Tick s={s} />} tone={s === 'READ' ? 'info' : 'brand'} />)}</div>
    <DataTable rows={rows} rowKey={(m) => m.id} exportName={`${channel}-log`} onRowClick={(m) => link(m) && nav(link(m))} searchText={(m) => `${m.recipient} ${m.message} ${m.relatedLabel}`}
      filters={<><Select aria-label="Type" className="w-40" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={['Visitor approval', 'Ticket assignment', 'Work assignment', 'Emergency']} placeholder="All types" /><Select aria-label="Status" className="w-32" value={f.st} onChange={(e) => setF({ ...f, st: e.target.value })} options={['SENT', 'DELIVERED', 'READ', 'FAILED']} placeholder="All statuses" /></>}
      columns={[{ key: 'r', header: 'Recipient', sort: (m) => m.recipient, render: (m) => <span className="whitespace-nowrap">{m.recipient} <span className="text-muted">· {m.contact}</span></span>, csv: (m) => m.recipient },
        ...(wa ? [] : [{ key: 'su', header: 'Subject', render: (m: ML) => m.subject, csv: (m: ML) => m.subject }]),
        { key: 'm', header: 'Message', render: (m) => <span className="line-clamp-2 max-w-md text-muted">{m.message}</span>, csv: (m) => m.message, hideMobile: true }, { key: 't', header: 'Type', sort: (m) => m.type, render: (m) => <span className="whitespace-nowrap">{m.type}</span>, csv: (m) => m.type },
        { key: 'rel', header: 'Related', render: (m) => m.relatedLabel, csv: (m) => m.relatedLabel, hideMobile: true }, { key: 'd', header: 'Sent', sort: (m) => m.sentAt, render: (m) => <Muted>{fmtDateTime(m.sentAt)}</Muted>, csv: (m) => m.sentAt }, { key: 's', header: 'Status', sort: (m) => m.status, render: (m) => <Pill tone={MT[m.status] ?? 'muted'}>{m.status.charAt(0) + m.status.slice(1).toLowerCase()}</Pill>, csv: (m) => m.status }]} /></>
}
