import { Star } from 'lucide-react'
import { Avatar, StatusBadge } from '@/components/ui'
import type { Employee } from '@/types'
import { activeTasks } from '@/services/employeeService'
export function StaffCard({ e, onClick, right }: { e: Employee; onClick?: () => void; right?: React.ReactNode }) {
  const n = activeTasks(e.id).length
  return (
    <div onClick={onClick} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-2 hover:shadow-card" role={onClick ? 'button' : undefined}>
      <Avatar name={e.name} src={e.photo} size={32} />
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{e.name}</p><p className="truncate text-xxs text-muted">{e.category} · {n} active · <Star size={9} className="inline fill-warn text-warn" /> {e.rating || '—'}</p></div>
      {right ?? <StatusBadge status={e.status} />}
    </div>
  )
}
