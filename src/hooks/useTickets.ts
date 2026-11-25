import { useMemo } from 'react'
import { useDb } from '@/store/db'
export function useTickets() {
  const all = useDb((s) => s.tickets), tf = useDb((s) => s.towerFilter)
  return useMemo(() => {
    const tickets = tf === 'all' ? all : all.filter((t) => t.towerId === tf)
    const n = (s: string) => tickets.filter((t) => t.status === s).length
    const overdue = tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status) && new Date(t.dueAt) < new Date()).length
    return { tickets, stats: { open: n('OPEN'), assigned: n('ASSIGNED'), progress: n('IN_PROGRESS'), waiting: n('WAITING'), resolved: n('RESOLVED'), closed: n('CLOSED'), overdue, critical: tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED').length, active: tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)).length } }
  }, [all, tf])
}
