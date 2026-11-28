import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button, Modal, Textarea } from '@/components/ui'
import * as ts from '@/services/ticketService'
import type { Ticket } from '@/types'

/** Owner decision on a ticket raised by an office employee. `soft` renders compact icon-only buttons. */
export function OwnerTicketActions({ t, soft }: { t: Ticket; soft?: boolean }) {
  const [open, setOpen] = useState(false), [why, setWhy] = useState('')
  if (t.status !== 'PENDING_OWNER') return null
  return <>
    {soft
      ? <><button type="button" title="Approve" aria-label="Approve" onClick={() => ts.ownerApprove(t.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ok/10 text-ok transition-colors hover:bg-ok/20"><Check size={15} /></button>
        <button type="button" title="Decline" aria-label="Decline" onClick={() => setOpen(true)} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-bad/10 text-bad transition-colors hover:bg-bad/20"><X size={15} /></button></>
      : <><Button variant="success" icon={<Check size={14} />} onClick={() => ts.ownerApprove(t.id)}>Approve</Button><Button variant="danger" icon={<X size={14} />} onClick={() => setOpen(true)}>Decline</Button></>}
    <Modal open={open} onClose={() => setOpen(false)} title={`Decline ${t.code}`} size="sm" footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { ts.ownerReject(t.id, why.trim() || undefined); setOpen(false); setWhy('') }}>Decline ticket</Button></>}>
      <Textarea autoFocus value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Reason (optional)" aria-label="Reason" />
    </Modal>
  </>
}
