import type { ReactNode } from 'react'
import { cx } from '@/utils/helpers'
const TONES = { green: 'bg-ok/10 text-ok', orange: 'bg-warn/10 text-warn', red: 'bg-bad/10 text-bad', blue: 'bg-info/10 text-info', gray: 'bg-subtle text-muted', purple: 'bg-vis/10 text-vis', brand: 'bg-brand-soft text-brand' }
export type Tone = keyof typeof TONES
const MAP: Record<string, Tone> = {
  APPROVED: 'green', AVAILABLE: 'green', Occupied: 'green', Active: 'green', COMPLETED: 'green', RESOLVED: 'green', CLOSED: 'green', DELIVERED: 'green', READ: 'green', Operational: 'green', Connected: 'green', VERIFIED: 'green', Upcoming: 'blue',
  PENDING: 'orange', ASSIGNED: 'orange', ON_HOLD: 'orange', WAITING: 'orange', ON_BREAK: 'orange', Reserved: 'orange', 'Needs Service': 'orange', SENT: 'orange', INFO_REQUESTED: 'purple', HIGH: 'orange', MEDIUM: 'blue', Overdue: 'red', 'Expiring soon': 'orange',
  REJECTED: 'red', CRITICAL: 'red', FAILED: 'red', ABSENT: 'red', CANCELLED: 'red', 'Under Repair': 'red', 'Under Maintenance': 'red',
  INSIDE: 'blue', IN_PROGRESS: 'blue', ACCEPTED: 'blue', BUSY: 'blue', OPEN: 'blue',
  EXITED: 'gray', Vacant: 'gray', OFF_DUTY: 'gray', Inactive: 'gray', LOW: 'gray', Expired: 'red',
}
export const toneOf = (s: string): Tone => MAP[s] ?? 'gray'
export function Badge({ tone = 'gray', children, dot, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-md px-1.5 py-px text-[10.5px] font-semibold whitespace-nowrap ring-1 ring-inset ring-current/15', TONES[tone], className)}>{dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}</span>
}
export const StatusBadge = ({ status, label }: { status: string; label?: string }) => <Badge tone={toneOf(status)} dot>{label ?? status.replace(/_/g, ' ')}</Badge>
