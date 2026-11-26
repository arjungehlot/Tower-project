import { useState } from 'react'
import { Check, X, MessageSquareMore, DoorOpen, LogOut, Send } from 'lucide-react'
import { Button, Modal, Textarea } from '@/components/ui'
import * as vs from '@/services/visitorService'
import { useMe } from '@/hooks/useMe'
import type { Visitor } from '@/types'

/** All state transitions for a visitor, gated by role permissions. */
export function VisitorActions({ v, size = 'sm', big, iconOnly }: { v: Visitor; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; big?: boolean; iconOnly?: boolean }) {
  const { can, me, officeId } = useMe(), [modal, setModal] = useState<'reject' | 'info' | null>(null), [text, setText] = useState('')
  const sz = big ? 'xl' : size
  const mayDecide = can('visitors', 'approve') && (['SUPER_ADMIN', 'ADMIN'].includes(me?.role ?? '') || officeId === v.officeId)
  const btns = []
  if ((v.status === 'PENDING' || v.status === 'INFO_REQUESTED') && mayDecide) btns.push(<Button key="a" size={sz} variant="success" icon={<Check size={14} />} title="Approve" aria-label="Approve" onClick={() => vs.approve(v.id)}>{!iconOnly && 'Approve'}</Button>, <Button key="r" size={sz} variant="danger" icon={<X size={14} />} title="Reject" aria-label="Reject" onClick={() => setModal('reject')}>{!iconOnly && 'Reject'}</Button>, v.status === 'PENDING' && <Button key="i" size={sz} icon={<MessageSquareMore size={14} />} title="Request info" aria-label="Request info" onClick={() => setModal('info')}>{!iconOnly && 'Request info'}</Button>)
  if (v.status === 'INFO_REQUESTED' && me?.role === 'SECURITY_GUARD') btns.push(<Button key="s" size={sz} variant="primary" icon={<Send size={14} />} onClick={() => vs.resubmit(v.id)}>Send info & resubmit</Button>)
  if (v.status === 'APPROVED' && can('visitors', 'exit')) btns.push(<Button key="e" size={sz} variant="primary" icon={<DoorOpen size={big ? 22 : 14} />} onClick={() => vs.allowEntry(v.id)}>{big ? 'ALLOW ENTRY' : 'Allow entry'}</Button>)
  if (v.status === 'INSIDE' && can('visitors', 'exit')) btns.push(<Button key="x" size={sz} variant="warn" icon={<LogOut size={big ? 22 : 14} />} onClick={() => vs.markExit(v.id)}>{big ? 'MARK EXIT' : 'Mark exit'}</Button>)
  const done = () => { modal === 'reject' ? vs.reject(v.id, text || 'Rejected by host') : vs.requestInfo(v.id, text || undefined); setModal(null); setText('') }
  return <>
    {btns}
    <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'reject' ? `Reject ${v.name}` : 'Request more information'} size="sm" footer={<><Button onClick={() => setModal(null)}>Cancel</Button><Button variant={modal === 'reject' ? 'danger' : 'primary'} onClick={done}>{modal === 'reject' ? 'Reject visitor' : 'Send request'}</Button></>}>
      <Textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={modal === 'reject' ? 'Reason (optional)' : 'What do you need to know?'} aria-label="Message" />
    </Modal>
  </>
}
