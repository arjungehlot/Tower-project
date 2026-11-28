import { useState } from 'react'
import { Check, Play, Pause, X, Star, CheckCheck, Ban } from 'lucide-react'
import { Button } from '@/components/ui'
import { RateModal } from './RateModal'
import * as ts from '@/services/taskService'
import { useMe } from '@/hooks/useMe'
import { useDb } from '@/store/db'
import type { Task } from '@/types'

/** Workflow buttons. Staff act on their own tasks; admins/supervisors can act on behalf of staff while demo mode is on. */
export function TaskActions({ t, size = 'sm' }: { t: Task; size?: 'xs' | 'sm' | 'md' }) {
  const { me, can, empId } = useMe(), demo = useDb((s) => s.demoMode), [rate, setRate] = useState<Task | null>(null)
  const staffAct = (me?.role === 'STAFF' && empId === t.assignedEmployeeId) || (demo && can('tasks', 'update') && me?.role !== 'STAFF')
  const mgr = can('tasks', 'assign')
  const b: React.ReactNode[] = []
  if (staffAct) {
    if (t.status === 'ASSIGNED') b.push(<Button key="a" size={size} variant="success" icon={<Check size={13} />} onClick={() => ts.accept(t.id)}>Accept</Button>, <Button key="r" size={size} variant="danger" icon={<X size={13} />} onClick={() => ts.reject(t.id)}>Reject</Button>)
    if (t.status === 'ACCEPTED') b.push(<Button key="s" size={size} variant="primary" icon={<Play size={13} />} onClick={() => ts.start(t.id)}>Start work</Button>)
    if (t.status === 'IN_PROGRESS') b.push(<Button key="h" size={size} icon={<Pause size={13} />} onClick={() => ts.hold(t.id)}>Hold</Button>, <Button key="c" size={size} variant="success" icon={<CheckCheck size={13} />} onClick={() => ts.complete(t.id)}>Complete</Button>)
    if (t.status === 'ON_HOLD') b.push(<Button key="rs" size={size} variant="primary" icon={<Play size={13} />} onClick={() => ts.resume(t.id)}>Resume</Button>)
  }
  if (mgr && t.status === 'COMPLETED' && !t.verifiedAt) b.push(<Button key="v" size={size} variant="primary" icon={<Star size={13} />} onClick={() => setRate(t)}>Verify & rate</Button>)
  if (mgr && ['ASSIGNED', 'ACCEPTED', 'ON_HOLD', 'REJECTED'].includes(t.status)) b.push(<Button key="x" size={size} variant="ghost" icon={<Ban size={13} />} onClick={() => ts.cancel(t.id)}>Cancel</Button>)
  return <>{b}<RateModal task={rate} onClose={() => setRate(null)} /></>
}
