import { useMemo } from 'react'
import { useDb } from '@/store/db'
import { useMe } from './useMe'
export function useTickets() {
  const raw = useDb((s) => s.tickets), tf = useDb((s) => s.towerFilter), role = useMe().me?.role, gated = !!role && ['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'STAFF', 'SECURITY_GUARD'].includes(role)
  const all = useMemo(() => (gated ? raw.filter((t) => t.status !== 'PENDING_OWNER' && t.status !== 'OWNER_REJECTED') : raw), [raw, gated])
  return useMemo(() => {
    const tickets = tf === 'all' ? all : all.filter((t) => t.towerId === tf)
    const n = (s: string) => tickets.filter((t) => t.status === s).length
    const overdue = tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status) && new Date(t.dueAt) < new Date()).length
    return { tickets, stats: { open: n('OPEN'), assigned: n('ASSIGNED'), progress: n('IN_PROGRESS'), waiting: n('WAITING'), resolved: n('RESOLVED'), closed: n('CLOSED'), overdue, critical: tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED').length, active: tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)).length } }
  }, [all, tf])
}
