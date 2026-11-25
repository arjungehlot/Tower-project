import { useMemo } from 'react'
import { useDb } from '@/store/db'
import { avg } from '@/utils/helpers'
export function useEmployees() {
  const all = useDb((s) => s.employees)
  return useMemo(() => {
    const staff = all.filter((e) => e.role === 'staff'), supervisors = all.filter((e) => e.role === 'supervisor')
    const n = (s: string) => staff.filter((e) => e.status === s).length
    return { staff, supervisors, all, stats: { total: staff.length, available: n('AVAILABLE'), busy: n('BUSY'), onBreak: n('ON_BREAK'), offDuty: n('OFF_DUTY'), absent: n('ABSENT'), active: staff.filter((e) => !['OFF_DUTY', 'ABSENT'].includes(e.status)).length, avgRating: avg(staff.map((e) => e.rating).filter(Boolean)) } }
  }, [all])
}
