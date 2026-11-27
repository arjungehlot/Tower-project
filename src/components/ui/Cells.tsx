import type { ReactNode } from 'react'
import { cx } from '@/utils/helpers'
import { fmtDate, fmtTime } from '@/utils/dateUtils'

/** Plain building blocks for table cells: one compact status pill and unadorned text helpers. */
const TONE = { ok: 'bg-ok/10 text-ok', warn: 'bg-warn/10 text-warn', bad: 'bg-bad/10 text-bad', info: 'bg-info/10 text-info', brand: 'bg-brand/10 text-brand', vis: 'bg-vis/10 text-vis', muted: 'bg-subtle text-muted' }
export type PillTone = keyof typeof TONE
export const Pill = ({ tone = 'muted', children, className }: { tone?: PillTone; children: ReactNode; className?: string }) => <span className={cx('inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium', TONE[tone], className)}>{children}</span>
export const Dash = () => <span className="text-faint">—</span>
/** "27 Nov, 09:23 am" — no year, single line. */
export const shortDT = (iso?: string) => iso ? <span className="whitespace-nowrap">{fmtDate(iso).replace(/ \d{4}$/, '')}, {fmtTime(iso)}</span> : <Dash />
export const Muted = ({ children }: { children: ReactNode }) => <span className="whitespace-nowrap text-muted">{children}</span>
