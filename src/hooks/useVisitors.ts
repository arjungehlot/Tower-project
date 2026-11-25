import { useMemo } from 'react'
import { useDb } from '@/store/db'
import { isToday } from '@/utils/dateUtils'

export function useVisitors() {
  const all = useDb((s) => s.visitors), towerFilter = useDb((s) => s.towerFilter)
  return useMemo(() => {
    const visitors = towerFilter === 'all' ? all : all.filter((v) => v.towerId === towerFilter)
    const today = visitors.filter((v) => isToday(v.requestedAt))
    const c = (st: string) => today.filter((v) => v.status === st).length
    return { visitors, today, inside: visitors.filter((v) => v.status === 'INSIDE'), pending: visitors.filter((v) => v.status === 'PENDING'), approved: visitors.filter((v) => v.status === 'APPROVED'),
      stats: { total: today.length, inside: visitors.filter((v) => v.status === 'INSIDE').length, exited: c('EXITED'), pending: visitors.filter((v) => v.status === 'PENDING').length, rejected: c('REJECTED'), entered: today.filter((v) => v.entryAt).length } }
  }, [all, towerFilter])
}
