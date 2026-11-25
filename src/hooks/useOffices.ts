import { useMemo } from 'react'
import { useDb } from '@/store/db'
export function useOffices() {
  const all = useDb((s) => s.offices), tf = useDb((s) => s.towerFilter)
  return useMemo(() => {
    const offices = tf === 'all' ? all : all.filter((o) => o.towerId === tf)
    const n = (s: string) => offices.filter((o) => o.status === s).length
    return { offices, stats: { total: offices.length, occupied: n('Occupied'), vacant: n('Vacant'), reserved: n('Reserved'), maintenance: n('Under Maintenance') } }
  }, [all, tf])
}
