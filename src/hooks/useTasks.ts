import { useMemo } from 'react'
import { useDb } from '@/store/db'
import { isToday } from '@/utils/dateUtils'
export function useTasks() {
  const tasks = useDb((s) => s.tasks)
  return useMemo(() => {
    const active = tasks.filter((t) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status))
    return { tasks, active, stats: { pending: active.length, completedToday: tasks.filter((t) => t.status === 'COMPLETED' && isToday(t.completedAt)).length, overdue: active.filter((t) => new Date(t.deadline) < new Date()).length, toVerify: tasks.filter((t) => t.status === 'COMPLETED' && !t.verifiedAt).length } }
  }, [tasks])
}
