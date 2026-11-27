import { useRecent, isNew } from '@/store/recent'
import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, MoreHorizontal, Pencil, Plus, Rows3, Search, Trash2 } from 'lucide-react'
import { useDb } from '@/store/db'
import { auditLog } from '@/services/core'
import { NewTag, Button, ConfirmDialog, DataTable, Dropdown, PageHeader, Select, type Column } from '@/components/ui'
import { CrudForm, type FieldDef } from './CrudForm'
import { uid } from '@/utils/helpers'
import type { Coll, Db } from '@/types'

export interface FilterDef<T> { label: string; options: string[]; pick: (r: T) => string }
interface Props<T extends { id: string }> {
  title: string; subtitle?: string; coll: Coll; entity: string; rows?: T[]; columns: Column<T>[]; fields: FieldDef[]
  make?: (v: Record<string, unknown>) => T; transform?: (v: Record<string, unknown>) => Record<string, unknown>
  searchText: (r: T) => string; filters?: FilterDef<T>[]; onRowClick?: (r: T) => void; readOnly?: boolean; label: (r: T) => string
  actions?: ReactNode; cards?: (r: T, menu: ReactNode) => ReactNode; afterChange?: () => void; exportName?: string; canDelete?: boolean; pageSize?: number
}
/** Generic list + drawer-form CRUD used by towers, offices, tenants, staff, assets, documents, users… */
export function CrudPage<T extends { id: string }>(p: Props<T>) {
  const all = useDb((s) => s[p.coll]) as unknown as T[], { add, patch, remove } = useDb()
  const rows = p.rows ?? all, fresh = useRecent((s) => s.ids)
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState<{ open: boolean; item: T | null }>({ open: false, item: null })
  const [del, setDel] = useState<T | null>(null)
  const [fv, setFv] = useState<Record<string, string>>({}), [view, setView] = useState<'cards' | 'table'>('cards'), [q, setQ] = useState('')
  useEffect(() => { if (params.get('new') && !p.readOnly) { setForm({ open: true, item: null }); setParams({}, { replace: true }) } }, [params]) // eslint-disable-line
  const filtered = rows.filter((r) => (p.filters ?? []).every((f) => !fv[f.label] || f.pick(r) === fv[f.label]))
  const save = (v: Record<string, unknown>) => {
    const val = p.transform ? p.transform(v) : v
    if (form.item) { patch(p.coll, form.item.id, val as never); auditLog(`updated ${p.entity} ${p.label({ ...form.item, ...val } as T)}`, p.entity + 's', p.label({ ...form.item, ...val } as T)); useDb.getState().toast(`${p.entity} updated.`) }
    else { const item = p.make ? p.make(val) : ({ id: uid(p.coll.slice(0, 2)), ...val } as unknown as T); add(p.coll, item as never); auditLog(`created ${p.entity} ${p.label(item)}`, p.entity + 's', p.label(item)); useDb.getState().toast(`${p.entity} added.`) }
    p.afterChange?.()
  }
  const menu = (r: T) => <Dropdown trigger={<button aria-label="Row actions" className="rounded p-1 text-muted hover:bg-subtle"><MoreHorizontal size={15} /></button>} items={[{ label: 'Edit', icon: <Pencil size={13} />, onClick: () => setForm({ open: true, item: r }) }, { label: 'Delete', icon: <Trash2 size={13} />, danger: true, hidden: p.canDelete === false, onClick: () => setDel(r) }]} />
  const cols: Column<T>[] = p.readOnly ? p.columns : [...p.columns, { key: '_a', header: '', className: 'w-10 text-right', render: (r) => menu(r) }]
  return (
    <>
      <PageHeader title={p.title} subtitle={p.subtitle} actions={<>{p.actions}{p.cards && <div className="inline-flex rounded-lg border border-line bg-subtle p-0.5">{([['cards', 'Cards', LayoutGrid], ['table', 'Table', Rows3]] as const).map(([v, l, I]) => <button key={v} type="button" onClick={() => setView(v)} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${view === v ? 'bg-surface text-brand shadow-card' : 'text-muted hover:text-ink'}`}><I size={13} />{l}</button>)}</div>}{!p.readOnly && <Button variant="primary" icon={<Plus size={14} />} onClick={() => setForm({ open: true, item: null })}>Add {p.entity}</Button>}</>} />
      {p.cards && view === 'cards' ? (() => {
        const t = q.trim().toLowerCase(), shown = filtered.filter((r) => !t || p.searchText(r).toLowerCase().includes(t))
        return <div>
          <div className="mb-3 flex flex-wrap items-center gap-2"><div className="relative w-64"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><input aria-label="Search" className="input pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            {p.filters?.map((f) => <Select key={f.label} aria-label={f.label} className="w-36" value={fv[f.label] ?? ''} onChange={(e) => setFv({ ...fv, [f.label]: e.target.value })} options={f.options} placeholder={f.label} />)}
            <span className="ml-auto text-xs text-muted">{shown.length} of {rows.length}</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{shown.map((r) => <div key={r.id} className={isNew(fresh, r.id) ? 'relative rounded-2xl ring-2 ring-info/30' : undefined}>{isNew(fresh, r.id) && <NewTag className="absolute left-3 top-0 z-10 -translate-y-1/2 bg-surface" />}{p.cards!(r, p.readOnly ? null : menu(r))}</div>)}</div>
          {!shown.length && <p className="py-10 text-center text-sm text-muted">No {p.entity.toLowerCase()}s found.</p>}
        </div>
      })() : (
      <DataTable rows={filtered} columns={cols} rowKey={(r) => r.id} onRowClick={p.onRowClick} searchText={p.searchText} exportName={p.exportName ?? p.coll} pageSize={p.pageSize}
        filters={p.filters?.map((f) => <Select key={f.label} aria-label={f.label} className="w-36" value={fv[f.label] ?? ''} onChange={(e) => setFv({ ...fv, [f.label]: e.target.value })} options={f.options} placeholder={f.label} />)}
        empty={{ title: `No ${p.entity.toLowerCase()}s found`, text: 'Try a different search or add a new record.', action: p.readOnly ? undefined : `Add ${p.entity}`, onAction: () => setForm({ open: true, item: null }) }} />
      )}
      <CrudForm open={form.open} onClose={() => setForm({ open: false, item: null })} title={form.item ? `Edit ${p.entity}` : `Add ${p.entity}`} fields={p.fields} initial={form.item as unknown as Record<string, unknown>} onSubmit={save} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title={`Delete ${p.entity}`} message={`Delete ${del ? p.label(del) : ''}? This cannot be undone.`} onConfirm={() => { if (del) { remove(p.coll, del.id); auditLog(`deleted ${p.entity} ${p.label(del)}`, p.entity + 's', p.label(del)); useDb.getState().toast(`${p.entity} deleted.`, 'info'); p.afterChange?.() } }} />
    </>
  )
}
export type { Db }
