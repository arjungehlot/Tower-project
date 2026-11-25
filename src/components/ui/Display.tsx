import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, animate } from 'framer-motion'
import { Star, Inbox, TrendingUp, TrendingDown } from 'lucide-react'
import { cx, initials, colorFor } from '@/utils/helpers'
import { fmtTime } from '@/utils/dateUtils'
import { Button } from './Button'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export const Card = ({ children, className, title, action, pad = true }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; pad?: boolean }) => (
  <section className={cx('rounded-xl border border-line bg-surface shadow-card', className)}>
    {(title || action) && <header className="flex items-center justify-between gap-2 border-b px-3 py-2"><h3 className="text-[12.5px] font-semibold tracking-tight">{title}</h3>{action}</header>}
    <div className={pad ? 'p-3' : ''}>{children}</div>
  </section>
)
export function Avatar({ name, src, size = 28 }: { name: string; src?: string; size?: number }) {
  return src ? <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
    : <span aria-label={name} style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.38 }} className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white">{initials(name)}</span>
}
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null), prev = useRef(0)
  useEffect(() => { const c = animate(prev.current, value, { duration: 0.7, onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-IN') } }); prev.current = value; return () => c.stop() }, [value])
  return <span ref={ref}>{value.toLocaleString('en-IN')}</span>
}
export function StatCard({ label, value, icon, sub, trend, tone = 'brand', spark, onClick }: { label: string; value: number | string; icon: ReactNode; sub?: ReactNode; trend?: number; tone?: 'brand' | 'ok' | 'warn' | 'bad' | 'info' | 'vis'; spark?: number[]; onClick?: () => void }) {
  const tile: Record<string, string> = { brand: 'from-brand/20 to-brand/5 text-brand', ok: 'from-ok/25 to-ok/5 text-ok', warn: 'from-warn/25 to-warn/5 text-warn', bad: 'from-bad/25 to-bad/5 text-bad', info: 'from-info/25 to-info/5 text-info', vis: 'from-vis/25 to-vis/5 text-vis' }
  const bar: Record<string, string> = { brand: 'bg-brand', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-info', vis: 'bg-vis' }
  const stroke: Record<string, string> = { brand: '#6366f1', ok: '#16a34a', warn: '#d97706', bad: '#dc2626', info: '#2563eb', vis: '#9333ea' }
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick} className={cx('group relative overflow-hidden rounded-xl border border-line bg-surface px-3 py-2.5 shadow-card transition-shadow hover:shadow-pop', onClick && 'cursor-pointer')}>
      <span className={cx('absolute left-0 top-2.5 h-[calc(100%-20px)] w-[3px] rounded-r', bar[tone])} />
      <div className="flex items-center gap-2.5">
        {icon && <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br', tile[tone])}>{icon}</span>}
        <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="text-[20px] font-bold leading-tight tracking-tight">{typeof value === 'number' ? <CountUp value={value} /> : value}</p></div>
        {trend !== undefined && <span className={cx('inline-flex items-center gap-0.5 self-start rounded-full px-1.5 py-0.5 text-[10px] font-bold', trend >= 0 ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad')}>{trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(trend)}%</span>}
      </div>
      {sub && <p className="mt-1.5 truncate pl-0.5 text-[11px] text-muted">{sub}</p>}
      {spark && spark.length > 1 && <div className="pointer-events-none absolute bottom-0 right-0 h-9 w-24 opacity-70"><ResponsiveContainer><AreaChart data={spark.map((v) => ({ v }))}><Area dataKey="v" stroke={stroke[tone]} fill={stroke[tone]} fillOpacity={0.18} strokeWidth={1.5} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>}
    </motion.div>
  )
}
export function Timeline({ items }: { items: { at: string; label: string }[] }) {
  return (
    <ol className="relative space-y-3 border-l border-line pl-4">
      {items.map((it, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="relative">
          <span className={cx('absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface', i === items.length - 1 ? 'bg-brand' : 'bg-faint')} />
          <p className="text-xxs font-semibold text-muted">{fmtTime(it.at)}</p><p className="text-[13px]">{it.label}</p>
        </motion.li>
      ))}
    </ol>
  )
}
export function ProgressBar({ value, tone = 'brand', className }: { value: number; tone?: 'brand' | 'ok' | 'warn' | 'bad' | 'info'; className?: string }) {
  const c = { brand: 'bg-brand', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-info' }[tone]
  return <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className={cx('h-1.5 w-full overflow-hidden rounded-full bg-subtle', className)}><motion.div className={cx('h-full rounded-full', c)} initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} /></div>
}
export function EmptyState({ title, text, action, onAction }: { title: string; text?: string; action?: string; onAction?: () => void }) {
  return <div className="flex flex-col items-center justify-center py-12 text-center"><span className="mb-3 rounded-full bg-subtle p-3 text-faint"><Inbox size={22} /></span><p className="text-sm font-semibold">{title}</p>{text && <p className="mt-1 max-w-xs text-xs text-muted">{text}</p>}{action && <Button className="mt-3" variant="primary" onClick={onAction}>{action}</Button>}</div>
}
export const Skeleton = ({ className }: { className?: string }) => <div className={cx('animate-pulse rounded-md bg-subtle', className)} />
export const LoadingState = () => <div className="space-y-3"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div><Skeleton className="h-64" /></div>
export function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return <span className="inline-flex" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} of 5 stars`}>{[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} disabled={!onChange} aria-label={`${i} star`} onClick={() => onChange?.(i)} className={cx(onChange && 'hover:scale-110 transition-transform')}><Star size={size} className={i <= Math.round(value) ? 'fill-warn text-warn' : 'text-line'} /></button>)}</span>
}
export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void }) {
  return <div role="tablist" className="flex gap-1 overflow-x-auto border-b">{tabs.map((t) => <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={cx('relative whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors', value === t.id ? 'text-brand' : 'text-muted hover:text-ink')}>{t.label}{t.count !== undefined && <span className="ml-1.5 rounded-full bg-subtle px-1.5 text-xxs">{t.count}</span>}{value === t.id && <motion.span layoutId={`tab-${tabs[0].id}`} className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />}</button>)}</div>
}
export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return <span className="group relative inline-flex">{children}<span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xxs text-white opacity-0 shadow-pop transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{text}</span></span>
}
export function Dropdown({ trigger, items, align = 'right' }: { trigger: ReactNode; items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean; hidden?: boolean }[]; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false), ref = useRef<HTMLDivElement>(null)
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <div onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>{trigger}</div>
      {open && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="menu" className={cx('absolute z-40 mt-1 min-w-[10rem] rounded-lg border border-line bg-surface p-1 shadow-pop', align === 'right' ? 'right-0' : 'left-0')}>
        {items.filter((i) => !i.hidden).map((i) => <button key={i.label} role="menuitem" onClick={() => { setOpen(false); i.onClick() }} className={cx('flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-subtle', i.danger && 'text-bad')}>{i.icon}{i.label}</button>)}
      </motion.div>}
    </div>
  )
}
export const KV = ({ k, v }: { k: string; v: ReactNode }) => <div className="flex justify-between gap-3 py-1.5 text-xs"><span className="text-muted">{k}</span><span className="text-right font-medium">{v || '—'}</span></div>
export const PageHeader = ({ title, subtitle, actions, back }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; back?: ReactNode }) => (
  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
    <div>{back}<h1 className="text-[17px] font-bold leading-tight tracking-tight">{title}</h1>{subtitle && <p className="text-[11.5px] text-muted">{subtitle}</p>}</div><div className="flex flex-wrap gap-2">{actions}</div>
  </div>
)
