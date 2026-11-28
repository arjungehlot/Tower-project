import { useMemo } from 'react'
import { useDb } from '@/store/db'
import { useSeen } from '@/store/seen'
import { useMe } from './useMe'
import { visibleTo } from '@/services/notificationService'

/** Number of entries received today (and not yet opened) per sidebar path. */
export function useNavBadges(): Record<string, number> {
  const { me, empId, officeId, ownedIds } = useMe()
  const tickets = useDb((s) => s.tickets), visitors = useDb((s) => s.visitors), tasks = useDb((s) => s.tasks), notes = useDb((s) => s.notifications)
  const seen = useSeen((s) => s.at)
  return useMemo(() => {
    if (!me) return {}
    const day0 = new Date().setHours(0, 0, 0, 0)
    const fresh = (path: string, iso?: string) => { if (!iso) return false; const t = new Date(iso).getTime(); return t >= day0 && t > (seen[path] ?? 0) }
    const count = <T,>(path: string, rows: T[], at: (r: T) => string | undefined) => rows.filter((r) => fresh(path, at(r))).length
    const isOwner = me.role === 'OWNER', isOffice = me.role.startsWith('OFFICE'), isStaff = me.role === 'STAFF'
    const out: Record<string, number> = {}
    out['/tickets'] = count('/tickets', tickets, (t) => t.createdAt)
    out['/tickets/mine'] = count('/tickets/mine', tickets.filter((t) => (isOwner ? ownedIds.includes(t.officeId) : t.officeId === officeId)), (t) => t.createdAt)
    out['/visitors'] = isOwner ? 0 : count('/visitors', isOffice ? visitors.filter((v) => v.officeId === officeId) : visitors, (v) => v.requestedAt)
    out['/tasks'] = count('/tasks', isStaff ? tasks.filter((t) => t.assignedEmployeeId === empId) : tasks, (t) => t.createdAt)
    out['/notifications'] = notes.filter((n) => visibleTo(n, me) && !n.read).length
    return out
  }, [me, empId, officeId, ownedIds, tickets, visitors, tasks, notes, seen])
}
