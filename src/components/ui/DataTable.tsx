import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { SearchBox } from './Form'
import { Button } from './Button'
import { EmptyState } from './Display'
import { cx, downloadCsv } from '@/utils/helpers'

export interface Column<T> { key: string; header: string; render?: (r: T) => ReactNode; sort?: (r: T) => string | number; className?: string; hideMobile?: boolean; csv?: (r: T) => unknown }
interface Props<T> {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void
  searchText?: (r: T) => string; filters?: ReactNode; toolbar?: ReactNode; pageSize?: number
  selectable?: boolean; bulk?: (ids: string[], clear: () => void) => ReactNode
  empty?: { title: string; text?: string; action?: string; onAction?: () => void }; exportName?: string; defaultSort?: { key: string; dir: 'asc' | 'desc' }
}
/** Compact table: sticky header, search, sort, pagination, bulk select, and card layout on mobile. */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, searchText, filters, toolbar, pageSize = 10, selectable, bulk, empty, exportName, defaultSort }: Props<T>) {
  const [q, setQ] = useState(''), [page, setPage] = useState(0), [sort, setSort] = useState(defaultSort ?? null as { key: string; dir: 'asc' | 'desc' } | null), [sel, setSel] = useState<Set<string>>(new Set())
  const data = useMemo(() => {
    let r = rows
    if (q && searchText) { const s = q.toLowerCase(); r = r.filter((x) => searchText(x).toLowerCase().includes(s)) }
    if (sort) { const c = columns.find((c) => c.key === sort.key); if (c?.sort) r = [...r].sort((a, b) => { const x = c.sort!(a), y = c.sort!(b); return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === 'asc' ? 1 : -1) }) }
    return r
  }, [rows, q, sort, columns, searchText])
  const pages = Math.max(1, Math.ceil(data.length / pageSize)), cur = Math.min(page, pages - 1)
  const slice = data.slice(cur * pageSize, cur * pageSize + pageSize)
  const toggleSort = (k: string) => setSort((s) => (s?.key === k ? (s.dir === 'asc' ? { key: k, dir: 'desc' } : null) : { key: k, dir: 'asc' }))
  const allSel = slice.length > 0 && slice.every((r) => sel.has(rowKey(r)))
  const flip = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center gap-1.5 border-b bg-subtle/40 p-2">
        {searchText && <SearchBox value={q} onChange={(v) => { setQ(v); setPage(0) }} className="w-full sm:w-60" />}
        {filters}
        <div className="ml-auto flex items-center gap-2">
          {sel.size > 0 && bulk?.([...sel], () => setSel(new Set()))}
          {toolbar}
          {exportName && <Button size="sm" icon={<Download size={13} />} onClick={() => downloadCsv(exportName, data.map((r) => Object.fromEntries(columns.map((c) => [c.header, c.csv ? c.csv(r) : c.sort ? c.sort(r) : ''])))) }>CSV</Button>}
        </div>
      </div>
      {data.length === 0 ? <EmptyState {...(empty ?? { title: 'No records found', text: 'Try adjusting your search or filters.' })} /> : (
        <>
          <div className="hidden max-h-[64vh] overflow-auto md:block">
            <table className="w-full border-separate border-spacing-0 text-left text-[12.5px]">
              <thead className="sticky top-0 z-10 bg-subtle/95 text-[10px] uppercase tracking-wider text-muted backdrop-blur">
                <tr>
                  {selectable && <th className="w-8 border-b px-3 py-2"><input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel((s) => { const n = new Set(s); slice.forEach((r) => (allSel ? n.delete(rowKey(r)) : n.add(rowKey(r)))); return n })} /></th>}
                  {columns.map((c) => <th key={c.key} className={cx('border-b px-3 py-2 font-bold', c.className)} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.sort ? <button className="inline-flex items-center gap-1 uppercase hover:text-ink" onClick={() => toggleSort(c.key)}>{c.header}{sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</button> : c.header}</th>)}
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={rowKey(r)} onClick={() => onRowClick?.(r)} className={cx('group transition-colors even:bg-subtle/25 hover:bg-brand-soft/60', onRowClick && 'cursor-pointer')}>
                    {selectable && <td className="border-b border-line/60 px-3 py-1.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label="Select row" checked={sel.has(rowKey(r))} onChange={() => flip(rowKey(r))} /></td>}
                    {columns.map((c) => <td key={c.key} className={cx('border-b border-line/60 px-3 py-1.5 align-middle first:font-medium group-hover:border-line', c.className)}>{c.render ? c.render(r) : (r as Record<string, ReactNode>)[c.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-line md:hidden">
            {slice.map((r) => (
              <div key={rowKey(r)} onClick={() => onRowClick?.(r)} className="space-y-1.5 p-3">
                {columns.filter((c) => !c.hideMobile).map((c, i) => <div key={c.key} className={cx('flex justify-between gap-3 text-xs', i === 0 && 'text-sm font-semibold')}>{i > 0 && <span className="text-muted">{c.header}</span>}<span className={i > 0 ? 'text-right' : ''}>{c.render ? c.render(r) : (r as Record<string, ReactNode>)[c.key]}</span></div>)}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t bg-subtle/30 px-3 py-1.5 text-xs text-muted">
            <span>Showing <b className="text-ink">{cur * pageSize + 1}–{Math.min(data.length, cur * pageSize + pageSize)}</b> of <b className="text-ink">{data.length}</b></span>
            <div className="flex items-center gap-0.5"><Button size="xs" variant="ghost" aria-label="Previous page" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft size={14} /></Button>
              {Array.from({ length: pages }, (_, i) => i).filter((i) => i === 0 || i === pages - 1 || Math.abs(i - cur) <= 1).map((i, k, arr) => <span key={i} className="flex items-center">{k > 0 && arr[k - 1] !== i - 1 && <span className="px-1">…</span>}<button onClick={() => setPage(i)} aria-label={`Page ${i + 1}`} aria-current={i === cur} className={cx('h-6 min-w-6 rounded-md px-1.5 text-xxs font-semibold', i === cur ? 'bg-brand text-white dark:text-slate-900' : 'hover:bg-subtle')}>{i + 1}</button></span>)}
              <Button size="xs" variant="ghost" aria-label="Next page" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight size={14} /></Button></div>
          </div>
          </>
      )}
    </div>
  )
}
