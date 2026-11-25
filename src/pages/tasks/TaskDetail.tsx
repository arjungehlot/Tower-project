import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip } from 'lucide-react'
import { Avatar, Button, Card, Input, KV, PageHeader, ProgressBar, StatusBadge, Stars, Timeline } from '@/components/ui'
import { TaskActions } from '@/components/business/TaskActions'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import * as ts from '@/services/taskService'
import { fmtDateTime, fmtTime } from '@/utils/dateUtils'

export default function TaskDetail() {
  const { id } = useParams(), L = useLookups(), { me } = useMe(), t = useDb((s) => s.tasks.find((x) => x.id === id)), [msg, setMsg] = useState(''), [proof, setProof] = useState('')
  if (!t) return <p className="p-6 text-muted">Task not found.</p>
  const emp = L.employee(t.assignedEmployeeId), sup = L.employee(t.supervisorId), canProgress = t.status === 'IN_PROGRESS' && (me?.role === 'STAFF' || useDb.getState().demoMode)
  const send = () => { if (msg.trim()) { ts.addComment(t.id, msg.trim(), me?.role === 'STAFF' ? 'staff' : 'admin'); setMsg('') } }
  return <>
    <PageHeader back={<Link to="/tasks" className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Tasks</Link>} title={<span className="flex flex-wrap items-center gap-2">{t.title}<StatusBadge status={t.status} /><StatusBadge status={t.priority} /></span>} subtitle={`${t.code} · ${t.category}`} actions={<TaskActions t={t} size="md" />} />
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title="Details"><p className="mb-3 text-[13px]">{t.description}</p>
          <div className="grid gap-x-8 sm:grid-cols-2"><KV k="Location" v={L.location(t.towerId, t.floorId, t.officeId) || 'Common area'} /><KV k="Assigned to" v={emp && <span className="inline-flex items-center gap-1.5"><Avatar name={emp.name} size={18} />{emp.name}</span>} /><KV k="Supervisor" v={sup?.name} /><KV k="Created by" v={L.user(t.createdBy)?.name ?? 'System'} /><KV k="Created" v={fmtDateTime(t.createdAt)} /><KV k="Deadline" v={fmtDateTime(t.deadline)} />
            <KV k="Started" v={t.startedAt && fmtDateTime(t.startedAt)} /><KV k="Completed" v={t.completedAt && fmtDateTime(t.completedAt)} /><KV k="Verified" v={t.verifiedAt && fmtDateTime(t.verifiedAt)} />{t.ticketId && <KV k="Ticket" v={<Link className="text-brand" to={`/tickets/${t.ticketId}`}>{useDb.getState().tickets.find((x) => x.id === t.ticketId)?.code}</Link>} />}</div>
          {t.attachments?.length ? <p className="mt-2 text-xs text-muted"><Paperclip size={12} className="mr-1 inline" />{t.attachments.join(', ')}</p> : null}</Card>
        <Card title="Progress"><div className="flex items-center gap-3"><ProgressBar value={t.progress} tone={t.status === 'COMPLETED' ? 'ok' : 'brand'} /><b className="text-xs">{t.progress}%</b></div>
          {canProgress && <div className="mt-3 flex flex-wrap items-center gap-2"><input type="range" aria-label="Progress" min={0} max={90} step={10} value={t.progress} onChange={(e) => ts.setProgress(t.id, +e.target.value)} className="flex-1" /><Input className="w-52" placeholder="Completion proof (file / note)" value={proof} onChange={(e) => setProof(e.target.value)} /><Button variant="success" size="sm" onClick={() => ts.complete(t.id, proof)}>Mark complete</Button></div>}
          {t.proof && <p className="mt-2 text-xs"><span className="text-muted">Completion proof:</span> {t.proof}</p>}</Card>
        {t.rating && <Card title="Rating"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{(['quality', 'speed', 'professionalism', 'cleanliness'] as const).map((k) => <div key={k}><p className="label">{k}</p><Stars value={t.rating![k]} size={13} /></div>)}</div><p className="mt-2 text-sm font-semibold">Overall {t.rating.overall}/5 {t.rating.comment && <span className="font-normal text-muted">— “{t.rating.comment}”</span>}</p></Card>}
        <Card title="Comments"><div className="space-y-2.5">{t.comments.map((c) => <div key={c.id} className="flex gap-2"><Avatar name={c.by} size={24} /><div className="rounded-lg bg-subtle px-3 py-1.5"><p className="text-xxs text-muted"><b className="text-ink">{c.by}</b> · {fmtTime(c.at)}</p><p className="text-xs">{c.text}</p></div></div>)}{!t.comments.length && <p className="text-xs text-muted">No comments yet.</p>}</div>
          <div className="mt-3 flex gap-2"><Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Add a comment…" aria-label="Comment" /><Button variant="primary" onClick={send} aria-label="Send"><Send size={14} /></Button></div></Card>
      </div>
      <Card title="Activity timeline"><Timeline items={t.timeline} /></Card>
    </div></>
}
